import { ResearchStudy, Bundle } from "fhir/r5";
import { createFhirClient } from "../../../shared/services/FhirClientFactory";
import Client from "fhir-kit-client";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirClient = createFhirClient();

const fhirCohortingEngineClient = new Client({
  baseUrl: process.env.REACT_APP_COHORTING_URL ?? "fhir",
});

/////////////////////////////////////
//           Helper utils          //
/////////////////////////////////////

/**
 * Return the canonical identifier to use for a study definition.
 * We prefer `ResearchStudy.url`. Fallback is the logical id.
 */
function getDefinitionCanonical(
  definition: ResearchStudy | null
): string | null {
  if (!definition) return null;
  if (definition.url && definition.url.trim() !== "") {
    return definition.url.trim();
  }
  if (definition.id && definition.id.trim() !== "") {
    return `ResearchStudy/${definition.id.trim()}`;
  }
  return null;
}

/**
 * Check whether a RelatedArtifact actually links an instance to a given
 * definition. We accept:
 *  - type "derived-from"
 *  - or an enum-like value exposing `.DERIVEDFROM`
 *
 * Then we compare the canonical reference of the artifact with the definition
 * canonical, ignoring any "|version" suffix.
 */
function isDerivedFromCanonical(
  ra: any,
  canonical: string
): boolean {
  if (!ra) return false;

  // type match
  const isDerivedType =
    ra.type === "derived-from" ||
    ra.type === ra.type?.DERIVEDFROM;

  if (!isDerivedType) return false;

  // Compare canonical ignoring version after '|'
  const referenced = (ra.resource ?? "").split("|")[0];
  return referenced === canonical;
}

/**
 * Extract ResearchStudy resources from a FHIR Bundle.
 */
function studiesFromBundle(bundle: Bundle): ResearchStudy[] {
  return (
    bundle.entry?.map((e) => e.resource as ResearchStudy).filter(Boolean) ?? []
  );
}

/////////////////////////////////////
//             Loaders            //
/////////////////////////////////////

/**
 * Load a study definition (a ResearchStudy "template") by logical id.
 *
 * @param definitionId Logical id of the ResearchStudy definition.
 * @returns Promise resolving to the ResearchStudy definition.
 */
export async function loadStudyDefinition(
  definitionId: string
): Promise<ResearchStudy> {
  return (await fhirClient.read({
    resourceType: "ResearchStudy",
    id: definitionId,
  })) as ResearchStudy;
}

/**
 * Load all instances derived from a given study definition.
 *
 * Strategy:
 *  1. Try a targeted server search using "related-artifact=<canonical>"
 *  2. If the server doesn't support that search parameter:
 *     - do a broader search
 *     - filter client-side.
 *
 * @param definition The ResearchStudy "template" resource.
 * @returns Promise resolving to an array of ResearchStudy instances.
 */
export async function loadStudyInstances(
  definition: ResearchStudy
): Promise<ResearchStudy[]> {
  if (!definition) return [];

  const canonical = getDefinitionCanonical(definition);
  if (!canonical) return [];

  // 1. First attempt: targeted search with related-artifact=<canonical>
  try {
    const bundle = (await fhirClient.search({
      resourceType: "ResearchStudy",
      searchParams: {
        "related-artifact": canonical,
        _count: 100,
      },
    })) as Bundle;

    const resources = studiesFromBundle(bundle);

    // Keep only ResearchStudy whose relatedArtifact points back with derived-from
    return resources.filter((rs) =>
      rs.relatedArtifact?.some((ra) => isDerivedFromCanonical(ra, canonical))
    );
  } catch (error_) {
    console.warn(
      "[loadStudyInstances] related-artifact search unsupported, falling back to broad search:",
      error_
    );
  }

  // 2. Fallback: broad search + client-side filtering
  try {
    const bundle = (await fhirClient.search({
      resourceType: "ResearchStudy",
      searchParams: { _count: 100, _sort: "-_lastUpdated" },
    })) as Bundle;

    const resources = studiesFromBundle(bundle);

    return resources.filter((rs) =>
      rs.relatedArtifact?.some((ra) => isDerivedFromCanonical(ra, canonical))
    );
  } catch (error_) {
    console.error("[loadStudyInstances] broad search fallback failed:", error_);
    throw new Error("Unable to load study instances");
  }
}

/**
 * Create a new study instance from a definition by calling the server-side
 * $instantiate-study operation on the cohorting engine.
 *
 * The operation is expected to return a Parameters resource that includes
 * a `studyInstanceUrl`. We then resolve that canonical back to a full
 * ResearchStudy instance on the primary FHIR server.
 *
 * If the operation succeeds but no instance can be resolved, returns null.
 *
 * @param definition The ResearchStudy definition used as a template.
 * @returns The newly created ResearchStudy instance, or null if not found.
 */
export async function instantiateStudy(
  definition: ResearchStudy
): Promise<ResearchStudy | null> {
  if (!definition?.url) {
    console.warn(
      "Cannot instantiate study without a canonical URL on the definition"
    );
    return null;
  }

  // Build Parameters resource for the $instantiate-study operation
  const params: any = {
    resourceType: "Parameters",
    parameter: [
      {
        name: "studyUrl",
        valueCanonical: definition.url,
      },
      {
        name: "researchStudyEndpoint",
        resource: {
          resourceType: "Endpoint",
          address: process.env.REACT_APP_FHIR_URL ?? "fhir",
        },
      },
    ],
  };

  try {
    // Execute server-side operation
    const result: any = await fhirCohortingEngineClient.operation({
      name: "instantiate-study",
      resourceType: "ResearchStudy",
      input: params,
    });

    // Extract canonical URL of the created instance
    const instanceParam = result.parameter?.find(
      (p: any) => p.name === "studyInstanceUrl"
    );
    const instanceCanonical = instanceParam?.valueCanonical;

    if (!instanceCanonical) {
      return null;
    }

    // Resolve that canonical URL back to the concrete ResearchStudy instance
    const instanceBundle = (await fhirClient.search({
      resourceType: "ResearchStudy",
      searchParams: { url: instanceCanonical },
    })) as Bundle;

    const entries = instanceBundle.entry ?? [];
    if (entries.length === 0) {
      return null;
    }

    return entries[0].resource as ResearchStudy;
  } catch (err) {
    console.error("Error instantiating study:", err);
    throw err;
  }
}
