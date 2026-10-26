import { instantiateStudy, loadStudyDefinition, loadStudyInstances } from "./studyDefinition.service";

const mockSearch = jest.fn();
const mockRead = jest.fn();
const mockOperation = jest.fn();
jest.mock("../../../shared/services/FhirClientFactory", () => ({
  createFhirClient: () => ({
    search: (...args: unknown[]) => mockSearch(...args),
    read: (...args: unknown[]) => mockRead(...args),
  }),
}));
jest.mock("fhir-kit-client", () => ({
  __esModule: true,
  default: class {
    operation(...args: unknown[]) { return mockOperation(...args); }
  },
}));

let warnSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  mockSearch.mockReset();
  mockRead.mockReset();
  mockOperation.mockReset();
  warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
  errorSpy.mockRestore();
});

test("loads a study definition by logical id", async () => {
  const definition = { resourceType: "ResearchStudy", id: "study-1" };
  mockRead.mockResolvedValue(definition);
  await expect(loadStudyDefinition("study-1")).resolves.toBe(definition);
  expect(mockRead).toHaveBeenCalledWith({ resourceType: "ResearchStudy", id: "study-1" });
});

test("filters targeted results by derived canonical and ignores its version", async () => {
  const derived = { resourceType: "ResearchStudy", id: "instance-1", relatedArtifact: [{ type: "derived-from", resource: "https://example.test/study|2.0" }] };
  mockSearch.mockResolvedValue({ resourceType: "Bundle", entry: [
    { resource: derived },
    { resource: { resourceType: "ResearchStudy", id: "unrelated", relatedArtifact: [{ type: "depends-on", resource: "https://example.test/study" }] } },
  ] });
  await expect(loadStudyInstances({ resourceType: "ResearchStudy", url: " https://example.test/study " } as any)).resolves.toEqual([derived]);
  expect(mockSearch).toHaveBeenCalledWith({ resourceType: "ResearchStudy", searchParams: { "related-artifact": "https://example.test/study", _count: 100 } });
});

test("falls back to a broad search when the server rejects the targeted parameter", async () => {
  mockSearch.mockRejectedValueOnce(new Error("Unsupported search parameter"));
  mockSearch.mockResolvedValueOnce({ resourceType: "Bundle", entry: [{ resource: {
    resourceType: "ResearchStudy", id: "instance-2", relatedArtifact: [{ type: "derived-from", resource: "ResearchStudy/template" }],
  } }] });
  await expect(loadStudyInstances({ resourceType: "ResearchStudy", id: "template" } as any)).resolves.toMatchObject([{ id: "instance-2" }]);
  expect(mockSearch).toHaveBeenNthCalledWith(2, { resourceType: "ResearchStudy", searchParams: { _count: 100, _sort: "-_lastUpdated" } });
});

test("reports failure after both instance search strategies fail", async () => {
  mockSearch.mockRejectedValue(new Error("FHIR unavailable"));
  await expect(loadStudyInstances({ resourceType: "ResearchStudy", id: "template" } as any)).rejects.toThrow("Unable to load study instances");
});

test("instantiates a study and resolves its new canonical", async () => {
  mockOperation.mockResolvedValue({ parameter: [{ name: "studyInstanceUrl", valueCanonical: "https://example.test/instance" }] });
  mockSearch.mockResolvedValue({ entry: [{ resource: { resourceType: "ResearchStudy", id: "instance-3" } }] });
  await expect(instantiateStudy({ resourceType: "ResearchStudy", url: "https://example.test/study" } as any)).resolves.toMatchObject({ id: "instance-3" });
  expect(mockOperation).toHaveBeenCalledWith(expect.objectContaining({ name: "instantiate-study", resourceType: "ResearchStudy" }));
  expect(mockSearch).toHaveBeenCalledWith({ resourceType: "ResearchStudy", searchParams: { url: "https://example.test/instance" } });
});

test("does not instantiate a definition without a canonical URL", async () => {
  await expect(instantiateStudy({ resourceType: "ResearchStudy", id: "template" } as any)).resolves.toBeNull();
  expect(mockOperation).not.toHaveBeenCalled();
});

test("skips instance search when the definition has no canonical or logical id", async () => {
  await expect(loadStudyInstances(null as any)).resolves.toEqual([]);
  await expect(loadStudyInstances({ resourceType: "ResearchStudy", id: "  " } as any)).resolves.toEqual([]);
  expect(mockSearch).not.toHaveBeenCalled();
});

test("returns no instances when targeted results have no derived artifact", async () => {
  mockSearch.mockResolvedValue({ resourceType: "Bundle", entry: [
    { resource: { resourceType: "ResearchStudy", id: "unlinked" } },
    { resource: { resourceType: "ResearchStudy", id: "different", relatedArtifact: [{ type: "derived-from", resource: "other" }] } },
    { resource: null },
  ] });
  await expect(loadStudyInstances({ resourceType: "ResearchStudy", url: "https://example.test/study" } as any)).resolves.toEqual([]);
});

test("returns null when instantiation has no canonical or an ambiguous result", async () => {
  mockOperation.mockResolvedValueOnce({ parameter: [] });
  await expect(instantiateStudy({ resourceType: "ResearchStudy", url: "https://example.test/study" } as any)).resolves.toBeNull();
  expect(mockSearch).not.toHaveBeenCalled();

  mockOperation.mockResolvedValueOnce({ parameter: [{ name: "studyInstanceUrl", valueCanonical: "https://example.test/new" }] });
  mockSearch.mockResolvedValueOnce({ entry: [
    { resource: { resourceType: "ResearchStudy", id: "one" } },
    { resource: { resourceType: "ResearchStudy", id: "two" } },
  ] });
  await expect(instantiateStudy({ resourceType: "ResearchStudy", url: "https://example.test/study" } as any)).resolves.toBeNull();
});

test("handles missing FHIR Parameters and missing bundle entries", async () => {
  mockOperation.mockResolvedValueOnce({});
  await expect(instantiateStudy({ resourceType: "ResearchStudy", url: "https://example.test/study" } as any)).resolves.toBeNull();

  mockOperation.mockResolvedValueOnce({ parameter: [{ name: "studyInstanceUrl", valueCanonical: "https://example.test/new" }] });
  mockSearch.mockResolvedValueOnce({ resourceType: "Bundle" });
  await expect(instantiateStudy({ resourceType: "ResearchStudy", url: "https://example.test/study" } as any)).resolves.toBeNull();
});

test("propagates cohorting operation failure", async () => {
  mockOperation.mockRejectedValue(new Error("Cohorting unavailable"));
  await expect(instantiateStudy({ resourceType: "ResearchStudy", url: "https://example.test/study" } as any))
    .rejects.toThrow("Cohorting unavailable");
  expect(errorSpy).toHaveBeenCalledWith("Error instantiating study:", expect.any(Error));
});
