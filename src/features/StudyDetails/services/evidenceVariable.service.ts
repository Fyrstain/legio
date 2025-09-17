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
  const fetchEvidenceVariableByType =
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
      const bundle = await fetchEvidenceVariableByType(studyId ?? "");
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
 * Map form data to a FHIR EvidenceVariable resource
 * To be used for creating or updating an EvidenceVariable
 *
 * @param data FormEvidenceVariableData
 * @param existingEV Optionally, the existing EvidenceVariable to update
 * @returns EvidenceVariable
 */
function mapFormDataToEvidenceVariable(
  data: FormEvidenceVariableData,
  existingEV?: EvidenceVariable
): EvidenceVariable {
  const base: EvidenceVariable = existingEV
    ? { ...existingEV }
    : ({ resourceType: "EvidenceVariable" } as EvidenceVariable);
  base.title = data.title;
  base.description = data.description;
  base.status = data.status as any;
  base.url = data.url;
  base.identifier = data.identifier
    ? [{ value: data.identifier }]
    : existingEV?.identifier;
  if (data.selectedLibrary?.url) {
    base.extension = [
      {
        url: "http://hl7.org/fhir/StructureDefinition/cqf-library",
        valueCanonical: data.selectedLibrary.url,
      },
    ];
  }
  return base;
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
  const evidenceVariable = mapFormDataToEvidenceVariable(data);
  const createdEvidenceVariable = (await fhirKnowledgeClient.create({
    resourceType: "EvidenceVariable",
    body: evidenceVariable,
  })) as EvidenceVariable;
  return createdEvidenceVariable;
}

/**
 * To update an existing EvidenceVariable with new data.
 *
 * @param evidenceVariableId is the id of the EV to update
 * @param updatedData is the updated data to apply
 * @param existingEV is the current state of the EV
 * @returns a promise of the updated EvidenceVariable
 */
async function updateEvidenceVariable(
  evidenceVariableId: string,
  updatedData: FormEvidenceVariableData,
  existingEV: EvidenceVariable
): Promise<EvidenceVariable> {
  try {
    const updatedEV = mapFormDataToEvidenceVariable(updatedData, existingEV);
    return (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
      body: updatedEV,
    })) as EvidenceVariable;
  } catch (error) {
    throw new Error(`Failed to update EvidenceVariable: ${error}`);
  }
}

/**
 * Navigate to a target combination using the provided path
 * @param parentEV The parent EvidenceVariable to navigate within
 * @param targetPath The path to navigate to
 * @return The characteristic at the target path
 */
function navigateToTargetCombination(
  parentEV: EvidenceVariable,
  targetPath: number[]
): any {
  let currentCharacteristic = parentEV.characteristic?.[targetPath[0]];
  // Check if the current characteristic is defined
  if (!currentCharacteristic) {
    throw new Error(`Characteristic not found at path index ${targetPath[0]}`);
  }
  // Navigate through the tree according to the targetPath
  for (let i = 1; i < targetPath.length; i++) {
    if (!currentCharacteristic.definitionByCombination?.characteristic) {
      throw new Error(`No combination found at path index ${i}`);
    }
    // Move to the next characteristic in the path
    currentCharacteristic =
      currentCharacteristic.definitionByCombination.characteristic[
        targetPath[i]
      ];
  }
  // Check that the final characteristic is indeed a combination
  if (!currentCharacteristic.definitionByCombination) {
    throw new Error(
      "Target characteristic is not a combination. Cannot add to non-combination."
    );
  }
  return currentCharacteristic;
}

/**
 * Add a characteristic to a target combination or at root level
 * @param parentEV The parent EvidenceVariable to update
 * @param newCharacteristic The new characteristic to add
 * @param targetPath Optional path to the target combination within the parent EvidenceVariable
 */
function addCharacteristicToEV(
  parentEV: EvidenceVariable,
  newCharacteristic: any,
  targetPath?: number[]
): void {
  if (targetPath && targetPath.length > 0) {
    // Add to specific combination
    const targetCombination = navigateToTargetCombination(parentEV, targetPath);
    // Ensure the characteristic array exists
    if (!targetCombination.definitionByCombination.characteristic) {
      targetCombination.definitionByCombination.characteristic = [];
    }
    // Add the new characteristic to the combination
    targetCombination.definitionByCombination.characteristic.push(
      newCharacteristic
    );
  } else {
    // Add at root level - logic depends on characteristic type
    addCharacteristicAtRootLevel(parentEV, newCharacteristic);
  }
}

/**
 * Add characteristic at root level with appropriate logic
 * @param parentEV The parent EvidenceVariable to update
 * @param newCharacteristic The new characteristic to add
 */
function addCharacteristicAtRootLevel(
  parentEV: EvidenceVariable,
  newCharacteristic: any
): void {
  if (!parentEV.characteristic || parentEV.characteristic.length === 0) {
    parentEV.characteristic = [newCharacteristic];
  } else if (parentEV.characteristic.length === 1) {
    const existingChar = parentEV.characteristic[0];
    // If existing is a combination, add to it
    if (existingChar.definitionByCombination) {
      // Add to existing combination
      if (!existingChar.definitionByCombination.characteristic) {
        existingChar.definitionByCombination.characteristic = [];
      }
      existingChar.definitionByCombination.characteristic.push(
        newCharacteristic
      );
    } else if (newCharacteristic.definitionByCombination) {
      // Adding combination to EV that already has non-combination characteristic
      throw new Error(
        "This EvidenceVariable already has a characteristic. Cannot add a combination."
      );
    } else {
      // Adding non-combination to EV that already has non-combination
      throw new Error(
        "This EvidenceVariable already has a characteristic. Cannot add another without creating a combination first."
      );
    }
  } else {
    throw new Error("Multiple characteristics found at root level");
  }
}

/**
 * Adds a definition by combination to an existing EvidenceVariable.
 *
 * @param parentEvidenceVariableId The ID of the parent EvidenceVariable to update.
 * @param combinationData The combination data to add.
 * @param targetPath Optional path to the target combination within the parent EvidenceVariable.
 * @returns The updated EvidenceVariable.
 */
async function addDefinitionByCombination(
  parentEvidenceVariableId: string,
  combinationData: CombinationFormData,
  targetPath?: number[]
): Promise<EvidenceVariable> {
  try {
    const parentEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
    })) as EvidenceVariable;
    // Create the new combination characteristic
    const newCombination: any = {
      linkId: combinationData.combinationId,
      description: combinationData.combinationDescription,
      definitionByCombination: {
        code: combinationData.code,
        characteristic: [],
      },
    };
    // Add XOR extension if needed
    if (combinationData.isXor && combinationData.code === "any-of") {
      newCombination.definitionByCombination.extension = [
        {
          url: "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-Exclusive-OR",
          valueBoolean: true,
        },
      ];
    }
    // Add the new combination characteristic to the parent EV at the specified path or root
    addCharacteristicToEV(parentEV, newCombination, targetPath);
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
 * @param targetPath Optional path to the target combination within the parent EvidenceVariable.
 * @returns The updated EvidenceVariable.
 */
async function addExistingCanonical(
  parentEvidenceVariableId: string,
  canonicalData: ExistingCanonicalFormData,
  targetPath?: number[]
): Promise<EvidenceVariable> {
  try {
    try {
      const canonicalBundle = await readEvidenceVariableByUrl(
        canonicalData.canonicalUrl
      );
      if (!canonicalBundle.entry || canonicalBundle.entry.length === 0) {
        throw new Error(
          `EvidenceVariable not found at canonical URL: ${canonicalData.canonicalUrl}`
        );
      }
    } catch (error) {
      throw new Error(
        `Cannot resolve canonical URL: ${canonicalData.canonicalUrl}. The EvidenceVariable is not accessible at this URL.`
      );
    }
    const parentEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
    })) as EvidenceVariable;
    // Create the new canonical characteristic
    const newCanonical = {
      definitionCanonical: canonicalData.canonicalUrl,
      exclude: canonicalData.exclude,
      description: canonicalData.canonicalDescription,
      ...(canonicalData.canonicalId && { linkId: canonicalData.canonicalId }),
    };
    // Add the new canonical characteristic to the parent EV at the specified path or root
    addCharacteristicToEV(parentEV, newCanonical, targetPath);
    return (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
      body: parentEV,
    })) as EvidenceVariable;
  } catch (error) {
    throw new Error(`Failed to add existing canonical: ${error}`);
  }
}

/**
 * Create a new EvidenceVariable and add it as definitionCanonical to an existing EV.
 *
 * @param parentEvidenceVariableId The ID of the parent EvidenceVariable to update.
 * @param newEVData The data for the new EvidenceVariable to create.
 * @param exclude Whether this canonical should be excluded.
 * @param targetPath Optional path to the target combination within the parent EvidenceVariable.
 * @returns The updated parent EvidenceVariable.
 */
async function addNewCanonical(
  parentEvidenceVariableId: string,
  newEVData: FormEvidenceVariableData,
  exclude: boolean = false,
  targetPath?: number[]
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
      canonicalData,
      targetPath
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
 * @param targetPath Optional path to the target combination within the parent EvidenceVariable.
 * @returns The updated EvidenceVariable.
 */
async function addDefinitionExpression(
  parentEvidenceVariableId: string,
  expressionData: ExpressionFormData,
  targetPath?: number[]
): Promise<EvidenceVariable> {
  try {
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
          {
            url: "name",
            valueCode: expressionData.selectedParameter,
          },
        ],
      };
      // Add the value based on the type
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
    // Add the new characteristic to the parent EV at the specified path or root
    addCharacteristicToEV(parentEV, newCharacteristic, targetPath);
    return (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
      body: parentEV,
    })) as EvidenceVariable;
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
  updateEvidenceVariable,
  addDefinitionByCombination,
  addExistingCanonical,
  addNewCanonical,
  addDefinitionExpression,
};

export default EvidenceVariableService;
