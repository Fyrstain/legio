// Service functions for working with study definitions and their instances.
//
// This file centralises access to FHIR to load a ResearchStudy definition and
// its derived instances. A definition is a ResearchStudy resource whose
// phase code is `template`. Instances are ResearchStudy resources that
// reference the definition via a RelatedArtifact of type `derived-from`.

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
//           Loaders              //
/////////////////////////////////////

/**
 * Load a study definition by id.
 *
 * @param definitionId The logical id of the ResearchStudy definition.
 * @returns A promise resolving to the ResearchStudy definition.
 */
export async function loadStudyDefinition(definitionId: string): Promise<ResearchStudy> {
  return (await fhirClient.read({
    resourceType: "ResearchStudy",
    id: definitionId,
  })) as ResearchStudy;
}

/**
 * Load instances derived from a given study definition.
 *
 * The server is queried for ResearchStudy resources whose relatedArtifact
 * references the canonical URL of the definition (either by URL or id).
 * If the server does not support search on relatedArtifact, the method
 * filters the results client-side.
 *
 * @param definition The ResearchStudy definition resource. The canonical URL is
 *  extracted from the `url` element; if absent, a relative reference based on
 *  the resource id is used.
 * @returns A promise resolving to an array of ResearchStudy instances.
 */
export async function loadStudyInstances(
  definition: ResearchStudy
): Promise<ResearchStudy[]> {
  if (!definition) {
    return [];
  }
  // Determine the canonical of the definition. Prefer the explicit URL; fallback to logical id.
  const canonical = definition.url ?? `ResearchStudy/${definition.id}`;
  try {
    // Attempt to perform a search on relatedArtifact. This search parameter may not
    // be supported on all FHIR servers. If the query fails, fall back to a
    // broader search and filter client-side.
    const bundle = (await fhirClient.search({
      resourceType: "ResearchStudy",
      searchParams: {
        "related-artifact": canonical,
        // Only return a reasonable number of resources
        _count: 100,
      },
    })) as Bundle;
    const resources = bundle.entry?.map((e) => e.resource as ResearchStudy) ?? [];
    // Filter to those with a derived-from relatedArtifact referencing the canonical
    return resources.filter((rs) =>
      rs.relatedArtifact?.some(
        (ra) =>
          ra.type === "derived-from" || ra.type === (ra.type as any)?.DERIVEDFROM
            ? // Compare canonical ignoring version after '|'
              (ra.resource ?? "").split("|")[0] === canonical
            : false
      )
    );
  } catch (err) {
    // Fall back: load all ResearchStudy resources referencing the canonical client-side
    try {
      const bundle = (await fhirClient.search({
        resourceType: "ResearchStudy",
        searchParams: { _count: 100 },
      })) as Bundle;
      const resources = bundle.entry?.map((e) => e.resource as ResearchStudy) ?? [];
      return resources.filter((rs) =>
        rs.relatedArtifact?.some(
          (ra) =>
            (ra.type === "derived-from" || (ra.type as any)?.DERIVEDFROM) &&
            (ra.resource ?? "").split("|")[0] === canonical
        )
      );
    } catch (inner) {
      throw new Error(`Unable to load study instances: ${inner}`);
    }
  }
}

/**
 * Placeholder for instantiation of a new study instance.  When the back-end
 * exposes the $instantiate-study operation, implement this method to call
 * that operation and return the created instance.  For now it simply
 * returns null.
 *
 * @param definition The definition from which to create an instance.
 */
export async function instantiateStudy(
  definition: ResearchStudy
): Promise<ResearchStudy | null> {
  if (!definition || !definition.url) {
    console.warn("Cannot instantiate study without a canonical URL");
    return null;
  }
  // Prepare the Parameters resource for the operation.
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
    const result: any = await fhirCohortingEngineClient.operation({
      name: "instantiate-study",
      resourceType: "ResearchStudy",
      input: params,
    });
    // The operation returns a Parameters resource.  Extract the studyInstanceUrl.
    const instanceParam = result.parameter?.find(
      (p: any) => p.name === "studyInstanceUrl"
    );
    const instanceCanonical = instanceParam?.valueCanonical;
    if (instanceCanonical) {
      
      const instance = (await fhirClient.search({
        resourceType: "ResearchStudy",
        searchParams: { url: instanceCanonical },
      })) as Bundle;
      return instance.entry && instance.entry.length > 0
        ? (instance.entry[0].resource as ResearchStudy)
        : null;
    }
    return null;
  } catch (err) {
    console.error("Error instantiating study:", err);
    throw err;
  }
}