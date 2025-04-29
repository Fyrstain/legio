// Resources
import { Bundle, ResearchStudy, Parameters, Group, List } from "fhir/r5";
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
  canonicalUrl: string
): Promise<Bundle> {
  return fhirClient.search({
    resourceType: "EvidenceVariable",
    searchParams: {
      url: canonicalUrl,
    },
  }) as Promise<Bundle>;
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
 * A generic function to execute FHIR operations.
 *
 * @param studyId The ID of the study.
 * @param operationName The name of the FHIR operation to execute.
 * @returns The promise of the operation result.
 */
async function executeFhirOperation<T>(
  studyId: string,
  operationName: string
): Promise<any> {
  const study = await loadStudy(studyId);
  if (!study) {
    throw new Error("Study not found");
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
  return executeFhirOperation<Group>(studyId, "$cohorting");
}

/**
 * The function to execute the datamart generation operation.
 *
 * @returns The promise of the operation result. A datamart containing the data for the study.
 */
async function executeGenerateDatamart(studyId: string): Promise<List> {
  return executeFhirOperation<List>(studyId, "$generate-datamart");
}

/**
 * The function to execute the cohorting and datamart generation operation.
 *
 * @returns The result of the cohorting and datamart generation operation.
 */
async function generateCohortAndDatamart(
  studyId: string
): Promise<{ cohortingResult: Group; datamartResult: List }> {
  try {
    const cohortingResult = await executeCohorting(studyId);
    const datamartResult = await executeGenerateDatamart(studyId);
    return { cohortingResult, datamartResult };
  } catch (error) {
    throw error;
  }
}

////////////////////////////
//        Exports         //
////////////////////////////

const StudyService = {
  loadStudy,
  loadListById,
  loadInclusionCriteria,
  loadStudyVariables,
  readEvidenceVariableByUrl,
  executeCohorting,
  executeGenerateDatamart,
  generateCohortAndDatamart,
};

export default StudyService;
