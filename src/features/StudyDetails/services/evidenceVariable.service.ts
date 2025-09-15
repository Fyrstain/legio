// Resources
import { Bundle, EvidenceVariable } from "fhir/r5";
// Client
import Client from "fhir-kit-client";
// Model
import { EvidenceVariableModel } from "../../../shared/models/EvidenceVariable.model";
// Types
import {
  CombinationFormData,
  ExistingCanonicalFormData,
  ExpressionFormData,
  FormEvidenceVariableData,
} from "../types/evidenceVariable.types";
// Service
import StudyService from "./study.service";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirKnowledgeClient = new Client({
  baseUrl: process.env.REACT_APP_KNOWLEDGE_URL ?? "fhir",
});

/**
 * Load all available EvidenceVariables from the server
 */
async function loadAllEvidenceVariables(): Promise<EvidenceVariableModel[]> {
  try {
    const bundle = (await fhirKnowledgeClient.search({
      resourceType: "EvidenceVariable",
      searchParams: { _count: 10000 },
    })) as Bundle;

    return (
      bundle.entry?.map(
        (entry) => new EvidenceVariableModel(entry.resource as EvidenceVariable)
      ) || []
    );
  } catch (error) {
    throw new Error(`Error loading all evidence variables: ${error}`);
  }
}

/**
 *  Load the inclusion criteria for a study.
 *
 * @param studyId The study id to load the inclusion criteria for.
 * @returns A promise of a Bundle containing the inclusion criteria.
 */
async function loadInclusionCriteria(studyId: string): Promise<Bundle> {
  return fhirKnowledgeClient.search({
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
  return fhirKnowledgeClient.search({
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
  return fhirKnowledgeClient.search({
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
  type: "inclusion" | "study"
): Promise<EvidenceVariableModel[]> {
  const serviceMethod =
    type === "inclusion" ? loadInclusionCriteria : loadStudyVariables;
  try {
    if (type === "inclusion") {
      // 1. Load the ResearchStudy
      const study = await StudyService.loadStudy(studyId);
      const eligibilityRef = study.recruitment?.eligibility?.reference;
      if (eligibilityRef) {
        // 2. Extract the ID of the parent EV (ex: "EvidenceVariable/1323" -> "1323")
        const evidenceVariableId = eligibilityRef.replace(
          "EvidenceVariable/",
          ""
        );
        // 3. Load the parent EV directly
        const parentEV = (await fhirKnowledgeClient.read({
          resourceType: "EvidenceVariable",
          id: evidenceVariableId,
        })) as EvidenceVariable;
        // 4. Return the parent EV (not the children for now)
        return [new EvidenceVariableModel(parentEV)];
      }
      return [];
    } else {
      // Load the bundle of evidence variables for the study
      const bundle = await serviceMethod(studyId ?? "");
      const { models, canonicalUrls } =
        EvidenceVariableModel.fromBundle(bundle);
      // If canonical URLs were found, read the EvidenceVariables by their URLs
      if (canonicalUrls.length > 0) {
        const canonicalResults = await Promise.all(
          canonicalUrls.map((url) => readEvidenceVariableByUrl(url))
        );
        // Convert the canonical results to EvidenceVariableModel instances
        return EvidenceVariableModel.fromCanonicalBundles(canonicalResults);
      }
      if (models.length > 0) {
        return models;
      }
    }
    // Ensure a return value in all code paths
    return [];
  } catch (error) {
    throw new Error("Error loading evidence variables: " + error);
  }
}

/**
 * Create a new EvidenceVariable.
 *
 * @param data The form data to create the EvidenceVariable
 * @returns A promise of the created EvidenceVariable
 */
async function createSimpleEvidenceVariable(
  data: FormEvidenceVariableData
): Promise<EvidenceVariable> {
  const evidenceVariable: EvidenceVariable = {
    resourceType: "EvidenceVariable",
    status: data.status as any,
    identifier: [{ value: data.identifier }],
    title: data.title,
    description: data.description,
    url: data.url,
    extension: [
      {
        url: "http://hl7.org/fhir/StructureDefinition/cqf-library",
        valueCanonical: data.selectedLibrary?.url,
      },
    ],
  };
  const createdEvidenceVariable = (await fhirKnowledgeClient.create({
    resourceType: "EvidenceVariable",
    body: evidenceVariable,
  })) as EvidenceVariable;
  return createdEvidenceVariable;
}

/**
 * Adds a definition by combination to an existing EvidenceVariable.
 *
 * @param parentEvidenceVariableId The ID of the parent EvidenceVariable to update.
 * @param combinationData The combination data to add.
 * @returns The updated EvidenceVariable.
 */
async function addDefinitionByCombination(
  parentEvidenceVariableId: string,
  combinationData: CombinationFormData
): Promise<EvidenceVariable> {
  try {
    const parentEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
    })) as EvidenceVariable;
    // Check if the parent EV already has a characteristic
    if (parentEV.characteristic) {
      throw new Error(
        "This EvidenceVariable already has a characteristic. Cannot add a combination."
      );
    }
    // Create the new combination characteristic
    const newCombination: any = {
      linkId: combinationData.combinationId,
      description: combinationData.combinationDescription,
      definitionByCombination: {
        // "all-of" or "any-of"
        code: combinationData.code,
        // Initially empty
        characteristic: [],
      },
    };
    // Add XOR if needed
    if (combinationData.isXor && combinationData.code === "any-of") {
      newCombination.definitionByCombination.extension = [
        {
          url: "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-Exclusive-OR",
          valueBoolean: true,
        },
      ];
    }
    parentEV.characteristic = [newCombination];
    // Update the parent EvidenceVariable
    return (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
      body: parentEV,
    })) as EvidenceVariable;
  } catch (error) {
    throw new Error(`Failed to add combination: ${error}`);
  }
}

/**
 * To add an existing canonical criteria to an EvidenceVariable.
 *
 * @param parentEvidenceVariableId The ID of the parent EvidenceVariable to update.
 * @param canonicalData The canonical data to add.
 * @returns The updated EvidenceVariable.
 */
/**
 * To add an existing canonical criteria to an EvidenceVariable.
 *
 * @param parentEvidenceVariableId The ID of the parent EvidenceVariable to update.
 * @param canonicalData The canonical data to add.
 * @returns The updated EvidenceVariable.
 */
async function addExistingCanonical(
  parentEvidenceVariableId: string,
  canonicalData: ExistingCanonicalFormData
): Promise<EvidenceVariable> {
  try {
    // Read the parent EvidenceVariable
    const parentEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
    })) as EvidenceVariable;
    // Case 1 : no characteristic => add a definitionCanonical directly
    if (!parentEV.characteristic || parentEV.characteristic.length === 0) {
      parentEV.characteristic = [
        {
          definitionCanonical: canonicalData.canonicalUrl,
          exclude: canonicalData.exclude,
          description: canonicalData.canonicalDescription,
          ...(canonicalData.canonicalId && {
            linkId: canonicalData.canonicalId,
          }),
        },
      ];
    }
    // Case 2 : Already one characteristic, check its type
    else if (parentEV.characteristic.length === 1) {
      const charac = parentEV.characteristic[0];
      // Case 2a : characteristic is a combination => add the canonical inside the combination
      if (charac.definitionByCombination) {
        if (!charac.definitionByCombination.characteristic) {
          charac.definitionByCombination.characteristic = [];
        }
        const newCanonical = {
          definitionCanonical: canonicalData.canonicalUrl,
          exclude: canonicalData.exclude,
          description: canonicalData.canonicalDescription,
          ...(canonicalData.canonicalId && {
            linkId: canonicalData.canonicalId,
          }),
        };
        charac.definitionByCombination.characteristic.push(newCanonical);
      }
      // Case 2b : characteristic is already a canonical => throw an error
      else if (charac.definitionCanonical && !charac.definitionByCombination) {
        throw new Error(
          "This EvidenceVariable already has a canonical characteristic. Cannot add another one."
        );
      }
      // Case 2c : characteristic is neither canonical nor combination => throw an error
      else {
        throw new Error(
          "The existing characteristic is neither a definitionCanonical nor a definitionByCombination."
        );
      }
    }
    // Case 3 : more than one characteristic at the root (not compliant with the profile)
    else {
      throw new Error(
        "The FHIR profile requires 0..1 characteristic at the root. Multiple characteristics found."
      );
    }
    // Update the parent EvidenceVariable
    const result = (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
      body: parentEV,
    })) as EvidenceVariable;
    return result;
  } catch (error) {
    console.error("Error in addExistingCanonical:", error);
    throw new Error(`Failed to add existing canonical: ${error}`);
  }
}

/**
 * Create a new EvidenceVariable and add it as definitionCanonical to an existing EV.
 *
 * @param parentEvidenceVariableId The ID of the parent EvidenceVariable to update.
 * @param newEVData The data for the new EvidenceVariable to create.
 * @param exclude Whether this canonical should be excluded.
 * @returns The updated parent EvidenceVariable.
 */
async function addNewCanonical(
  parentEvidenceVariableId: string,
  newEVData: FormEvidenceVariableData,
  exclude: boolean = false
): Promise<EvidenceVariable> {
  try {
    // 1. Create the new EvidenceVariable
    const newEV = await createSimpleEvidenceVariable(newEVData);
    // 2. Use the URL of the new EV as canonical
    const canonicalData: ExistingCanonicalFormData = {
      exclude: exclude,
      canonicalUrl: newEV.url!,
      canonicalId: newEV.identifier?.[0]?.value,
      canonicalDescription: newEV.description,
    };
    // 3. Add this new EV as definitionCanonical to the parent EV
    const updatedParentEV = await addExistingCanonical(
      parentEvidenceVariableId,
      canonicalData
    );
    return updatedParentEV;
  } catch (error) {
    throw new Error(`Failed to add new canonical: ${error}`);
  }
}

/**
 * Add a definitionExpression to an existing EvidenceVariable.
 *
 * @param parentEvidenceVariableId The ID of the parent EvidenceVariable to update.
 * @param expressionData The expression data to add.
 * @returns The updated EvidenceVariable.
 */
async function addDefinitionExpression(
  parentEvidenceVariableId: string,
  expressionData: ExpressionFormData
): Promise<EvidenceVariable> {
  try {
    // To find the parent EvidenceVariable
    const parentEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
    })) as EvidenceVariable;
    // Create the new definitionExpression
    const newExpression: any = {
      description: expressionData.expressionDescription,
      language: "text/cql-identifier",
      expression: expressionData.selectedExpression,
    };
    // Add parameterization extensions if needed
    if (expressionData.criteriaValue && expressionData.selectedParameter) {
      newExpression.extension = [];
      const paramExtension: any = {
        url: "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-EVParametrisation",
        extension: [
          // Name of the parameter is ALWAYS a valueCode
          {
            url: "name",
            valueCode: expressionData.selectedParameter,
          },
        ],
      };
      // The VALUE of the parameter varies according to the type
      const criteriaValue = expressionData.criteriaValue;
      if (
        criteriaValue.type === "integer" &&
        criteriaValue.value !== undefined
      ) {
        paramExtension.extension.push({
          url: "value",
          valueInteger: criteriaValue.value as number,
        });
      } else if (
        criteriaValue.type === "boolean" &&
        criteriaValue.value !== undefined
      ) {
        paramExtension.extension.push({
          url: "value",
          valueBoolean: criteriaValue.value as boolean,
        });
      } else if (
        criteriaValue.type === "date" &&
        criteriaValue.value !== undefined
      ) {
        paramExtension.extension.push({
          url: "value",
          valueDate: criteriaValue.value as string,
        });
      } else if (
        criteriaValue.type === "code" &&
        criteriaValue.value !== undefined
      ) {
        paramExtension.extension.push({
          url: "value",
          valueCode: criteriaValue.value as string,
        });
      }
      newExpression.extension.push(paramExtension);
    }
    // Create the new characteristic
    const newCharacteristic: any = {
      description: expressionData.expressionDescription,
      exclude: expressionData.exclude,
      definitionExpression: newExpression,
      linkId: expressionData.expressionId || undefined,
    };
    // Logical of adding the new characteristic to the parent EvidenceVariable
    if (!parentEV.characteristic || parentEV.characteristic.length === 0) {
      parentEV.characteristic = [newCharacteristic];
    } else if (parentEV.characteristic.length === 1) {
      const charac = parentEV.characteristic[0];
      if (charac.definitionByCombination) {
        if (!charac.definitionByCombination.characteristic) {
          charac.definitionByCombination.characteristic = [];
        }
        charac.definitionByCombination.characteristic.push(newCharacteristic);
      } else if (charac.definitionCanonical || charac.definitionExpression) {
        throw new Error(
          "This EvidenceVariable already has a characteristic. Cannot add an expression without creating a combination first."
        );
      } else {
        throw new Error("Unexpected characteristic type");
      }
    } else {
      throw new Error("Multiple characteristics found at root level");
    }
    const result = (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
      body: parentEV,
    })) as EvidenceVariable;
    return result;
  } catch (error) {
    throw new Error(`Failed to add definition expression: ${error}`);
  }
}

////////////////////////////
//        Exports         //
////////////////////////////

const EvidenceVariableService = {
  loadAllEvidenceVariables,
  loadInclusionCriteria,
  loadStudyVariables,
  readEvidenceVariableByUrl,
  loadEvidenceVariables,
  createSimpleEvidenceVariable,
  addDefinitionByCombination,
  addExistingCanonical,
  addNewCanonical,
  addDefinitionExpression,
};

export default EvidenceVariableService;
