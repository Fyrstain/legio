import { act, renderHook } from "@testing-library/react";
import { useFormValidation } from "./useFormValidation";

jest.mock("i18next", () => ({ __esModule: true, default: { t: (key: string) => key } }));

test("reports required, URL and identifier errors and clears a corrected field", () => {
  const { result } = renderHook(() => useFormValidation());

  act(() => {
    expect(result.current.validateField("name", "  ", true)).toBe("errormessage.requiredfield");
    expect(result.current.validateField("website-url", "not a URL")).toBe("errormessage.invalidurl");
    expect(result.current.validateField("studyId", "bad/id")).toBe("errormessage.invalidid");
  });
  expect(result.current.isValid).toBe(false);
  expect(Object.keys(result.current.errors)).toEqual(["name", "website-url", "studyId"]);

  act(() => {
    expect(result.current.validateField("name", "Study", true)).toBeNull();
    expect(result.current.validateField("website-url", "https://example.test/study")).toBeNull();
    expect(result.current.validateField("studyId", "study-1")).toBeNull();
  });
  expect(result.current.errors).toEqual({});
  expect(result.current.isValid).toBe(true);
});

test("clears all errors when a form is reset", () => {
  const { result } = renderHook(() => useFormValidation());
  act(() => { result.current.validateField("name", "", true); });
  expect(result.current.isValid).toBe(false);
  act(() => { result.current.clearErrors(); });
  expect(result.current.isValid).toBe(true);
});
