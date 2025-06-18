// Resources
import {
  Bundle,
  ResearchStudy,
  Parameters,
  Group,
  List,
  EvidenceVariable,
} from "fhir/r5";
// FHIR
import { createFhirClient } from "./FhirClientFactory";
// Mock FHIR
import { createMockFhirClient } from "./MockFhirClientFactory";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirClient = createFhirClient();
const mockFhirClient = createMockFhirClient();

/**
 * Load Study from the back to populate the fields.
 *
 * @returns the promise of a Study.
 */
async function loadStudy(studyId: string): Promise<ResearchStudy> {
  return fhirClient.read({
    resourceType: "ResearchStudy",
    id: studyId ?? "",
  }) as Promise<ResearchStudy>;
}

/**
 * Load the datamart for a study if it exists
 *
 * @param study The ResearchStudy resource
 * @returns a promise with the datamart list or null if it doesn't exist
 */
async function loadDatamartForStudy(
  study: ResearchStudy,
): Promise<List | null> {
  // Find the datamart extension
  const datamartExtension = study.extension?.find(
    (extension) =>
      extension.url ===
      "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-Datamart",
  );
  // Check if the datamart extension exists and has a valueReference
  if (datamartExtension) {
    const evaluationExt = datamartExtension.extension?.find(
      (ext) => ext.url === "evaluation",
    );
    if (evaluationExt?.valueReference?.reference) {
      // Extract the ID
      const reference = evaluationExt.valueReference.reference;
      const listId = reference.includes("/")
        ? reference.split("/")[1]
        : reference;
      try {
        // Load the list using the ID
        const list = await loadListById(listId);
        return list;
      } catch (error) {
        throw new Error("Error loading datamart list: " + error);
      }
    }
  }
  // If the datamart extension doesn't exist or has no valueReference, return null
  return null;
}

/**
 *  Load the inclusion criteria for a study.
 *
 * @param studyId The study id to load the inclusion criteria for.
 * @returns A promise of a Bundle containing the inclusion criteria.
 */
async function loadInclusionCriteria(studyId: string): Promise<Bundle> {
  return fhirClient.search({
    resourceType: "EvidenceVariable",
    searchParams: {
      "_has:ResearchStudy:eligibility:_id": studyId,
    },
  }) as Promise<Bundle>;
}

/**
 * Load the study variables for a study.
 *
 * @param studyId The study id to load the study variables for.
 * @returns A promise of a Bundle containing the study variables.
 */
async function loadStudyVariables(studyId: string): Promise<Bundle> {
  return fhirClient.search({
    resourceType: "EvidenceVariable",
    searchParams: {
      "_has:ResearchStudy:study-variables:_id": studyId,
    },
  }) as Promise<Bundle>;
}

/**
 * Read an EvidenceVariable by its canonical URL.
 *
 * @param canonicalUrl The canonical URL of the EvidenceVariable to load
 * @returns A promise of a Bundle containing the requested EvidenceVariable
 */
async function readEvidenceVariableByUrl(
  canonicalUrl: string,
): Promise<Bundle> {
  return fhirClient.search({
    resourceType: "EvidenceVariable",
    searchParams: {
      url: canonicalUrl,
    },
  }) as Promise<Bundle>;
}

/**
 * A function to load evidence variables for a study.
 *
 * @param studyId The study ID to load the evidence variables.
 * @param type The type of evidence variables to load (can be "inclusion" for Inclusion Criteria or "study" for Study Variable).
 * @returns A promise of an array of evidence variables.
 */
async function loadEvidenceVariables(
  studyId: string,
  type: "inclusion" | "study",
) {
  const serviceMethod =
    type === "inclusion" ? loadInclusionCriteria : loadStudyVariables;
  try {
    // Load the evidence variables using the service method, first level of EvidenceVariable
    const response = await serviceMethod(studyId ?? "");
    const bundle = response as Bundle;
    const evidencesVariables: Array<{
      title: string;
      description: string;
      expression?: string;
    }> = [];
    if (bundle.entry) {
      const canonicalUrls: string[] = [];
      // Extract canonical URLs from the EvidenceVariable resources
      bundle.entry.forEach((entry) => {
        if (entry.resource?.resourceType === "EvidenceVariable") {
          const evidenceVariable = entry.resource as EvidenceVariable;
          evidenceVariable.characteristic?.forEach((characteristic) => {
            if (characteristic.definitionByCombination?.characteristic) {
              characteristic.definitionByCombination.characteristic.forEach(
                (subCharacteristic) => {
                  if (subCharacteristic.definitionCanonical) {
                    canonicalUrls.push(subCharacteristic.definitionCanonical);
                  }
                },
              );
            }
          });
        }
      });
      // If canonical URLs were found, load the EvidenceVariable resources using the URLs
      if (canonicalUrls.length > 0) {
        const canonicalResults = await Promise.all(
          canonicalUrls.map((url) => readEvidenceVariableByUrl(url)),
        );
        canonicalResults.forEach((result) => {
          if (
            result.entry?.[0]?.resource?.resourceType === "EvidenceVariable"
          ) {
            const evidenceVariable = result.entry[0]
              .resource as EvidenceVariable;
            const details = extractEvidenceVariableDetails(evidenceVariable);
            evidencesVariables.push(details);
          }
        });
      } else {
        // If no canonical URLs were found, use the original bundle entries
        // TODO : We'll need to delete this part for the V1 when the canonical URLs will be always present
        bundle.entry.forEach((entry) => {
          if (entry.resource?.resourceType === "EvidenceVariable") {
            const evidenceVariable = entry.resource as EvidenceVariable;
            const details = extractEvidenceVariableDetails(evidenceVariable);
            evidencesVariables.push(details);
          }
        });
      }
    }
    return evidencesVariables;
  } catch (error) {
    throw new Error("Error loading evidence variables: " + error);
  }
}

/**
 * Function to extract the details from an EvidenceVariable resource.
 *
 * @param evidenceVariable The EvidenceVariable resource to extract data from
 * @returns An object containing the title, description, and expression of the EvidenceVariable
 */
function extractEvidenceVariableDetails(evidenceVariable: EvidenceVariable) {
  let expressionValue: string | undefined;
  if (evidenceVariable.characteristic) {
    evidenceVariable.characteristic.forEach((characteristic) => {
      if (characteristic.definitionByCombination) {
        expressionValue =
          characteristic.definitionByCombination?.characteristic?.[0]
            ?.definitionExpression?.expression;
      }
    });
  }
  return {
    title: evidenceVariable.title ?? "",
    description: evidenceVariable.description ?? "",
    expression: expressionValue,
  };
}

/**
 * Load a List resource by its ID.
 *
 * @param listId The ID of the list to load
 * @returns A promise of the List resource
 */
async function loadListById(listId: string): Promise<List> {
  return fhirClient.read({
    resourceType: "List",
    id: listId ?? "",
  }) as Promise<List>;
}

/**
 * A function to create the parameters for the cohorting and datamart generation operations.
 *
 * @param studyURL The study id to create the parameters for.
 * @returns a Parameters object containing the parameters for the cohorting and datamart generation operations.
 */
function createParameters(studyURL: string): Parameters {
  return {
    resourceType: "Parameters",
    parameter: [
      {
        name: "researchStudyUrl",
        valueCanonical: studyURL,
      },
      {
        name: "researchStudyEndpoint",
        resource: {
          resourceType: "Endpoint",
          status: "active",
          connectionType: [
            {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                  code: "hl7-fhir-rest",
                },
              ],
            },
          ],
          payload: [
            {
              type: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                      code: "hl7-fhir-rest",
                      display: "HL7 FHIR",
                    },
                  ],
                },
              ],
            },
          ],
          address: "http://localhost:8081/fhir",
          header: ["Content-Type: application/json"],
        },
      },
      {
        name: "dataEndpoint",
        resource: {
          resourceType: "Endpoint",
          status: "active",
          connectionType: [
            {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                  code: "hl7-fhir-rest",
                },
              ],
            },
          ],
          payload: [
            {
              type: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                      code: "hl7-fhir-rest",
                      display: "HL7 FHIR",
                    },
                  ],
                },
              ],
            },
          ],
          address: "http://localhost:8081/fhir",
          header: ["Content-Type: application/json"],
        },
      },
      {
        name: "terminologyEndpoint",
        resource: {
          resourceType: "Endpoint",
          status: "active",
          connectionType: [
            {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                  code: "hl7-fhir-rest",
                },
              ],
            },
          ],
          payload: [
            {
              type: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                      code: "hl7-fhir-rest",
                      display: "HL7 FHIR",
                    },
                  ],
                },
              ],
            },
          ],
          address: "https://hapi.fhir.org/baseR5",
          header: ["Content-Type: application/json"],
        },
      },
    ],
  };
}

/**
 * This function creates the parameters for the datamart export operation using the createParameters function.
 *
 * @param studyURL The study id to create the parameters for.
 * @returns a Parameters object containing the parameters for the datamart export operation.
 */
function createParametersForExportDatamart(studyURL: string): Parameters {
  const baseParameters = createParameters(studyURL);
  baseParameters.parameter = baseParameters.parameter || [];
  baseParameters.parameter.push(
    {
      name: "type",
      valueCode: "CSV",
    },
    {
      name: "structureMapUrl",
      valueCanonical:
        "https://www.centreantoinelacassagne.org/StructureMap/SM-ListParams-2-CSV",
    },
  );
  return baseParameters;
}

/**
 * A generic function to execute FHIR operations.
 *
 * @param studyId The ID of the study.
 * @param operationName The name of the FHIR operation to execute.
 * @returns The promise of the operation result.
 */
async function executeFhirOperation(
  studyId: string,
  operationName: string,
): Promise<any> {
  const study = await loadStudy(studyId);
  if (!study) {
    throw new Error("Study not found with ID: " + studyId);
  }
  const parameters: Parameters = createParameters(study.url ?? "");
  return mockFhirClient.operation({
    resourceType: "ResearchStudy",
    name: operationName,
    input: parameters,
  }) as Promise<any>;
}

/**
 * The function to execute the cohorting operation.
 *
 * @returns The promise of the operation result. A list of people that are eligible for the study.
 */
async function executeCohorting(studyId: string): Promise<Group> {
  return executeFhirOperation(studyId, "$cohorting");
}

/**
 * The function to execute the datamart generation operation.
 *
 * @returns The promise of the operation result. A datamart containing the data for the study.
 */
async function executeGenerateDatamart(studyId: string): Promise<List> {
  return executeFhirOperation(studyId, "$generate-datamart");
}

/**
 * The function to execute the cohorting and datamart generation operation.
 *
 * @returns The result of the cohorting and datamart generation operation.
 */
async function generateCohortAndDatamart(
  studyId: string,
): Promise<{ cohortingResult: Group; datamartResult: List }> {
  try {
    const cohortingResult = await executeCohorting(studyId);
    const datamartResult = await executeGenerateDatamart(studyId);
    return { cohortingResult, datamartResult };
  } catch (error) {
    throw new Error("Error while generating cohort and datamart: " + error);
  }
}

/**
 * A function to execute the datamart export operation.
 *
 * @param studyId The ID of the study to export the datamart for.
 * @returns a promise of the operation result. A datamart containing the data for the study.
 */
async function executeExportDatamart(studyId: string): Promise<any> {
  const study = await loadStudy(studyId);
  if (!study) {
    throw new Error("Study not found with ID: " + studyId);
  }
  const parameters: Parameters = createParametersForExportDatamart(
    study.url ?? "",
  );
  return mockFhirClient.operation({
    resourceType: "ResearchStudy",
    name: "$export-datamart",
    input: parameters,
  }) as Promise<any>;
}

////////////////////////////
//        Exports         //
////////////////////////////

const StudyService = {
  loadStudy,
  loadDatamartForStudy,
  loadListById,
  loadInclusionCriteria,
  loadStudyVariables,
  readEvidenceVariableByUrl,
  loadEvidenceVariables,
  executeCohorting,
  executeGenerateDatamart,
  generateCohortAndDatamart,
  executeExportDatamart,
};

export default StudyService;
