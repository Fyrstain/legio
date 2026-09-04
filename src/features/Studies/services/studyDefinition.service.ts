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
 * Canonical URL identifying a ResearchStudy definition.
 */
function getDefinitionCanonical(
  definition: ResearchStudy
): string | null {
  const canonical =
    definition.url?.trim();

  return canonical || null;
}

/**
 * Remove an optional canonical version suffix.
 *
 * example:
 *
 * https://example.org/ResearchStudy/foo|1.0.0
 *
 * becomes:
 *
 * https://example.org/ResearchStudy/foo
 */
function normalizeCanonical(
  canonical?: string
): string {
  return (
    canonical
      ?.split("|")[0]
      ?.trim() ?? ""
  );
}

/**
 * Return true when a RelatedArtifact
 * links a ResearchStudy instance to
 * the provided definition.
 */
function isDerivedFromDefinition(
  relatedArtifact: any,
  definitionCanonical: string
): boolean {
  if (!relatedArtifact) {
    return false;
  }

  if (
    relatedArtifact.type !==
    "derived-from"
  ) {
    return false;
  }

  const referencedCanonical =
    normalizeCanonical(
      relatedArtifact.resource
    );

  const expectedCanonical =
    normalizeCanonical(
      definitionCanonical
    );

  return (
    referencedCanonical ===
    expectedCanonical
  );
}

/**
 * Extract ResearchStudy resources
 * from a FHIR Bundle.
 */
function studiesFromBundle(
  bundle: Bundle
): ResearchStudy[] {
  return (
    bundle.entry
      ?.map((entry) =>
        entry.resource?.resourceType ===
        "ResearchStudy"
          ? (entry.resource as ResearchStudy)
          : null
      )
      .filter(
        (
          study
        ): study is ResearchStudy =>
          study !== null
      ) ?? []
  );
}

/////////////////////////////////////
//             Loaders             //
/////////////////////////////////////

/**
 * Load a ResearchStudy by logical id.
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
 * Load ResearchStudy instances derived
 * from a definition.
 *
 * First tries the related-artifact
 * SearchParameter.
 *
 * Falls back to retrieving ResearchStudy
 * resources and filtering client-side if
 * the server does not support it.
 */
export async function loadStudyInstances(
  definition: ResearchStudy
): Promise<ResearchStudy[]> {
  const canonical =
    getDefinitionCanonical(
      definition
    );

  if (!canonical) {
    console.warn(
      "[loadStudyInstances] Definition has no canonical URL."
    );

    return [];
  }

  /////////////////////////////////////
  //     Targeted server search      //
  /////////////////////////////////////

  try {
    const bundle =
      (await fhirClient.search({
        resourceType:
          "ResearchStudy",

        searchParams: {
          "related-artifact":
            canonical,

          _count: 100,

          _sort:
            "-_lastUpdated",
        },
      })) as Bundle;

    return studiesFromBundle(
      bundle
    ).filter((study) =>
      study.relatedArtifact?.some(
        (relatedArtifact) =>
          isDerivedFromDefinition(
            relatedArtifact,
            canonical
          )
      )
    );
  } catch (error) {
    console.warn(
      "[loadStudyInstances] related-artifact search unavailable. Using client-side fallback.",
      error
    );
  }

  /////////////////////////////////////
  //       Client-side fallback      //
  /////////////////////////////////////

  const bundle =
    (await fhirClient.search({
      resourceType:
        "ResearchStudy",

      searchParams: {
        _count: 100,

        _sort:
          "-_lastUpdated",
      },
    })) as Bundle;

  return studiesFromBundle(
    bundle
  ).filter((study) =>
    study.relatedArtifact?.some(
      (relatedArtifact) =>
        isDerivedFromDefinition(
          relatedArtifact,
          canonical
        )
    )
  );
}

/////////////////////////////////////
//          Instantiation          //
/////////////////////////////////////

/**
 * Instantiate a ResearchStudy definition
 * through the cohorting engine.
 */
export async function instantiateStudy(
  definition: ResearchStudy
): Promise<ResearchStudy | null> {
  const definitionCanonical =
    getDefinitionCanonical(
      definition
    );

  if (!definitionCanonical) {
    throw new Error(
      "The ResearchStudy definition has no canonical URL."
    );
  }

  const phase =
    definition.phase?.coding?.[0]?.code;

  if (phase !== "template") {
    throw new Error(
      `ResearchStudy ${definition.id ?? definitionCanonical} is not a template.`
    );
  }

  const fhirServerUrl =
    process.env.REACT_APP_FHIR_URL ??
    "fhir";

  const parameters = {
    resourceType: "Parameters",

    parameter: [
      {
        name: "studyUrl",

        valueCanonical:
          definitionCanonical,
      },

      {
        name:
          "researchStudyEndpoint",

        resource: {
          resourceType:
            "Endpoint",

          status: "active",

          connectionType: {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",

                code:
                  "hl7-fhir-rest",
              },
            ],
          },

          payloadType: [
            {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/resource-types",

                  code:
                    "ResearchStudy",
                },
              ],
            },
          ],

          address:
            fhirServerUrl,
        },
      },
    ],
  };

  /////////////////////////////////////
  //         Execute operation       //
  /////////////////////////////////////

  const result: any =
    await cohortingClient.operation({
      name:
        "instantiate-study",

      resourceType:
        "ResearchStudy",

      input:
        parameters,
    });

  /////////////////////////////////////
  //        Resolve result           //
  /////////////////////////////////////

  const studyInstanceUrl =
    result.parameter?.find(
      (parameter: any) =>
        parameter.name ===
        "studyInstanceUrl"
    )?.valueCanonical;

  if (!studyInstanceUrl) {
    console.warn(
      "[instantiateStudy] Operation returned no studyInstanceUrl."
    );

    return null;
  }

  const bundle =
    (await fhirClient.search({
      resourceType:
        "ResearchStudy",

      searchParams: {
        url:
          studyInstanceUrl,
      },
    })) as Bundle;

  const studies =
    studiesFromBundle(bundle);

  if (studies.length !== 1) {
    console.warn(
      `[instantiateStudy] Expected one ResearchStudy for ${studyInstanceUrl}, received ${studies.length}.`
    );

    return null;
  }

  return studies[0];
}
