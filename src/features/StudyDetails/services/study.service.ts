// Resources
import { ResearchStudy, Parameters, Group, List } from "fhir/r5";
// Client
import Client from "fhir-kit-client";
// Model

/////////////////////////////////////
//             Client              //F
/////////////////////////////////////

const fhirClient = new Client({
  baseUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
});

const fhirDatamartEngineClient = new Client({
  baseUrl: process.env.REACT_APP_DATAMART_URL ?? "fhir",
});

const fhirCohortingEngineClient = new Client({
  baseUrl: process.env.REACT_APP_COHORTING_URL ?? "fhir",
});

/////////////////////////////////////
//        Helper Functions         //
/////////////////////////////////////

/**
 * Create a coding object
 *
 * @param system The system URL for the coding.
 * @param code The code for the coding.
 * @param display The display name for the coding.
 * @returns The created coding object.
 */
const createCoding = (system: string, code: string, display?: string) => ({
  system,
  code,
  display: display || code,
});

/**
 * Update the name of an associated party in a research study.
 * 
 * @param existingStudy The existing research study to update.
 * @param roleCode The role code of the associated party to update.
 * @param newName The new name to assign to the associated party.
 */
const updateAssociatedParty = (
  existingStudy: ResearchStudy,
  roleCode: string,
  newName: string
) => {
  if (!existingStudy.associatedParty) {
    existingStudy.associatedParty = [];
  }
  const associatedParty = existingStudy.associatedParty.find(
    (party) => party.role?.coding?.[0]?.code === roleCode
  );
  if (associatedParty) {
    associatedParty.name = newName;
  } else if (newName) {
    // Create a new associatedParty if it doesn't exist
    existingStudy.associatedParty.push({
      name: newName,
      role: {
        coding: [
          createCoding(
            "http://hl7.org/fhir/research-study-party-role",
            roleCode,
            roleCode === "general-contact" ? "general-contact" : "sponsor"
          ),
        ],
      },
    });
  }
};

/**
 * Update the NCT identifier of a research study.
 * 
 * @param existingStudy The existing research study to update.
 * @param newNctId The new NCT ID to assign to the study.
 */
const updateIdentifier = (existingStudy: ResearchStudy, newNctId: string) => {
  if (!existingStudy.identifier) {
    existingStudy.identifier = [];
  }
  const systemUrl = "http://clinicaltrials.gov";
  // Find the existing NCT identifier
  const nctIdentifier = existingStudy.identifier.find(
    (id) => id.system === systemUrl
  );
  if (nctIdentifier) {
    // Update the existing NCT identifier
    nctIdentifier.value = newNctId;
  } else {
    // Add a new NCT identifier if it doesn't exist
    existingStudy.identifier.push({
      system: systemUrl,
      value: newNctId,
    });
  }
};

/**
 * Update the study design of a research study.
 * 
 * @param existingStudy The existing research study to update.
 * @param newStudyDesign The new study design to assign to the research study.
 */
const updateStudyDesign = (
  existingStudy: ResearchStudy,
  newStudyDesign: any[]
) => {
  if (Array.isArray(newStudyDesign) && newStudyDesign.length > 0) {
    if (newStudyDesign[0].coding) {
      existingStudy.studyDesign = newStudyDesign;
    } else {
      existingStudy.studyDesign = newStudyDesign.map((code) => ({
        coding: [createCoding("http://hl7.org/fhir/study-design", code, code)],
      }));
    }
  }
};

/////////////////////////////////////
//             Actions             //
/////////////////////////////////////

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
   * Is used to extract the study design codes from the ResearchStudy resource.
   * 
   * @param study The ResearchStudy resource to extract the study design codes from.
   * @returns a list of study design codes.
   */
 const extractStudyDesignCodes = (study: ResearchStudy) => {
    if (!study.studyDesign || study.studyDesign.length === 0) {
      return [""];
    }
    const codes = study.studyDesign.map((design) => {
      const code = design.coding?.[0]?.code || "";
      return code;
    });
    return codes.filter((code) => code !== "");
  };

/**
 * Update a ResearchStudy resource with the provided data.
 *
 * @param studyId The ID of the study to update.
 * @param updatedData The new data to update the study with.
 * @returns The updated ResearchStudy resource.
 */
async function updateStudy(
  studyId: string,
  updatedData: any
): Promise<ResearchStudy> {
  try {
    // Load the existing study
    const existingStudy = await loadStudy(studyId);
    // Update identifier - check if the property exists
    if (updatedData.hasOwnProperty("nctId")) {
      updateIdentifier(existingStudy, updatedData.nctId);
    }
    // Update associatedParty contacts - check if the properties exist
    if (updatedData.hasOwnProperty("localContact")) {
      updateAssociatedParty(
        existingStudy,
        "general-contact",
        updatedData.localContact
      );
    }
    if (updatedData.hasOwnProperty("studySponsorContact")) {
      updateAssociatedParty(
        existingStudy,
        "sponsor",
        updatedData.studySponsorContact
      );
    }
    // Update studyDesign - check if the property exists
    if (updatedData.hasOwnProperty("studyDesign")) {
      updateStudyDesign(existingStudy, updatedData.studyDesign);
    }
    // Create the updated object
    const updatedStudy = {
      ...existingStudy,
      // Update basic fields
      name: updatedData.name ?? existingStudy.name,
      title: updatedData.title ?? existingStudy.title,
      status: updatedData.status ?? existingStudy.status,
      description: updatedData.description ?? existingStudy.description,
      version: updatedData.version ?? existingStudy.version,
    };
    // Use of the update method
    const response = await fhirClient.update({
      resourceType: "ResearchStudy",
      id: studyId,
      body: updatedStudy,
    });
    return response as ResearchStudy;
  } catch (error) {
    throw new Error(`Failed to update study: ${error}`);
  }
}

/**
 * Load the datamart for a study if it exists
 *
 * @param study The ResearchStudy resource
 * @returns a promise with the datamart list or null if it doesn't exist
 */
async function loadDatamartForStudy(
  study: ResearchStudy
): Promise<List | null> {
  // Find the datamart extension
  const datamartExtension = study.extension?.find(
    (extension) =>
      extension.url ===
      "https://www.isis.com/StructureDefinition/EXT-Datamart"
  );
  // Check if the datamart extension exists and has a valueReference
  if (datamartExtension) {
    const evaluationExt = datamartExtension.extension?.find(
      (ext) => ext.url === "evaluation"
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
          address: process.env.REACT_APP_KNOWLEDGE_URL || "",
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
          address: process.env.REACT_APP_FHIR_URL || "",
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
          address: process.env.REACT_APP_TERMINOLOGY_URL || "",
          header: ["Content-Type: application/json"],
        },
      },
      {
        name: "cqlEngineEndpoint",
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
          address: process.env.REACT_APP_CQL_URL || "",
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
    {
        name: "remoteEndpoint",
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
          address: process.env.REACT_APP_Mapping_URL || "",
          header: ["Content-Type: application/json"],
        },
      }
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
async function executeFhirOperation<T>(
  studyId: string,
  operationName: string,
  client: Client
): Promise<any> {
  const study = await loadStudy(studyId);
  if (!study) {
    throw new Error("Study not found with ID: " + studyId);
  }
  const parameters: Parameters = createParameters(study.url ?? "");
  return client.operation({
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
  return executeFhirOperation<Group>(studyId, "$cohorting", fhirCohortingEngineClient);
}

/**
 * The function to execute the datamart generation operation.
 *
 * @returns The promise of the operation result. A datamart containing the data for the study.
 */
async function executeGenerateDatamart(studyId: string): Promise<List> {
  return executeFhirOperation<List>(studyId, "$generate-datamart", fhirDatamartEngineClient);
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
    throw new Error("Error while generating cohort and datamart: " + error);
  }
}

  /**
 * A function to get the value of a parameter.
 *
 * @param param The parameter to get the value from
 * @returns The value of the parameter as a string
 */
function getParameterValue(param: any): string {
  if (!param) return "";
  if (param.valueAge !== undefined) return param.valueAge.value;
  if (param.valueBoolean !== undefined)
    return param.valueBoolean.toString();
  if (param.valueString) return param.valueString;
  if (param.valueInteger !== undefined)
    return param.valueInteger.toString();
  if (param.valueDecimal !== undefined)
    return param.valueDecimal.toString();
  if (param.valueDateTime !== undefined) return param.valueDateTime.toString();
  if (param.valueDate !== undefined) return param.valueDate.toString();
  if (param.valueIdentifier && param.valueIdentifier.value)
    return param.valueIdentifier.value.toString();
  if (param.valueQuantity !== undefined)
    return param.valueQuantity.value + " " + param.valueQuantity.unit;
  return "";
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
    study.url ?? ""
  );
  return fhirDatamartEngineClient.operation({
    resourceType: "ResearchStudy",
    name: "$export-datamart",
    input: parameters,
  }) as Promise<any>;
}

/**
 * To add an evidence variable to a study.
 * 
 * @param studyId is the id of the study to add the evidence variable to.
 * @param evidenceVariableId is the id of the evidence variable to add.
 * @param type is the type of the evidence variable (inclusion or study).
 */
async function addEvidenceVariableToStudy(
  studyId: string,
  evidenceVariableId: string,
  type: "inclusion" | "study"
): Promise<void> {
  const study = await loadStudy(studyId);
  // To add the reference to the study (recruitment.eligibility) (Inclusion Criteria)
  if (type === "inclusion") {
    if (!study.recruitment) {
      study.recruitment = {};
    }
    study.recruitment.eligibility = {
      reference: `EvidenceVariable/${evidenceVariableId}`,
    };
  } else {
    // To add the reference to the study (extension) (Study Variable)
    if (!study.extension) study.extension = [];
    let datamartExtension = study.extension.find(
      (ext) =>
        ext.url ===
        "https://www.isis.com/StructureDefinition/EXT-Datamart"
    );
    if (!datamartExtension) {
      datamartExtension = {
        url: "https://www.isis.com/StructureDefinition/EXT-Datamart",
        extension: [],
      };
      study.extension.push(datamartExtension);
    }
    if (!datamartExtension.extension) {
      datamartExtension.extension = [];
    }
    datamartExtension.extension.push({
      url: "variable",
      valueReference: {
        reference: `EvidenceVariable/${evidenceVariableId}`,
      },
    });
  }
  // Update the study with the new evidence variable
  await fhirClient.update({
    resourceType: "ResearchStudy",
    id: studyId,
    body: study,
  });
}

////////////////////////////
//        Exports         //
////////////////////////////

const StudyService = {
  loadStudy,
  extractStudyDesignCodes,
  updateStudy,
  loadDatamartForStudy,
  loadListById,
  executeCohorting,
  executeGenerateDatamart,
  generateCohortAndDatamart,
  getParameterValue,
  executeExportDatamart,
  addEvidenceVariableToStudy,
};

export default StudyService;
