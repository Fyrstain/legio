// Resources
import { Bundle, EvidenceVariable } from "fhir/r5";
// Client
import Client from "fhir-kit-client";
// Model
import { EvidenceVariableModel } from "../../../shared/models/EvidenceVariable.model";
// Types
import {
  CanonicalFormData,
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
 * Navigate to a target characteristic using the provided path
 * @param parentEV The parent EvidenceVariable to navigate within
 * @param targetPath The path to navigate to
 * @return The characteristic at the target path (any type: combination, expression, canonical)
 */
function navigateToTargetCharacteristic(
  parentEV: EvidenceVariable,
  targetPath: number[]
): any {
  let currentCharacteristic = parentEV.characteristic?.[targetPath[0]];
  // Check if the characteristic exists
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
  return currentCharacteristic;
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
    const targetCombination = navigateToTargetCharacteristic(
      parentEV,
      targetPath
    );
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
 * To map form data to a combination characteristic.
 * @param combinationData is the form data for the combination.
 * @param existingCombination is the existing combination to update.
 * @returns The mapped combination characteristic.
 */
function mapFormDataToCombination(
  combinationData: CombinationFormData,
  existingCombination?: any
): any {
  const combination: any = existingCombination
    ? { ...existingCombination }
    : { definitionByCombination: { characteristic: [] } };
  // Set the fields from form data
  combination.exclude = combinationData.exclude;
  combination.linkId = combinationData.combinationId;
  combination.description = combinationData.combinationDescription;
  combination.definitionByCombination.code = combinationData.code;
  // Handle the XOR extension
  if (combinationData.isXor && combinationData.code === "any-of") {
    combination.definitionByCombination.extension = [
      {
        url: "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-Exclusive-OR",
        valueBoolean: true,
      },
    ];
  } else {
    // Remove the extension if it existed before
    combination.definitionByCombination.extension =
      combination.definitionByCombination.extension?.filter(
        (ext: { url: string }) =>
          ext.url !==
          "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-Exclusive-OR"
      );
  }
  return combination;
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
    const newCombination = mapFormDataToCombination(combinationData);
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
 * Updates a definition by combination in an existing EvidenceVariable.
 *
 * @param evidenceVariableId The ID of the EvidenceVariable to update.
 * @param combinationData The combination data to update.
 * @param targetPath The path to the target combination within the EvidenceVariable.
 * @returns The updated EvidenceVariable.
 */
async function updateDefinitionByCombination(
  evidenceVariableId: string,
  combinationData: CombinationFormData,
  targetPath?: number[]
): Promise<EvidenceVariable> {
  if (!targetPath || targetPath.length === 0) {
    throw new Error("targetPath is required to update a combination");
  }
  try {
    // Load the parent EvidenceVariable
    const parentEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
    })) as EvidenceVariable;
    // Navigate to the target combination
    const targetCombination = navigateToTargetCharacteristic(
      parentEV,
      targetPath
    );
    // Map the form data to the existing combination
    const updatedCombination = mapFormDataToCombination(
      combinationData,
      targetCombination
    );
    // Replace the existing combination in the parentEV tree
    let currentLevel = parentEV.characteristic!;
    for (let i = 0; i < targetPath.length - 1; i++) {
      currentLevel =
        currentLevel[targetPath[i]].definitionByCombination!.characteristic!;
    }
    currentLevel[targetPath[targetPath.length - 1]] = updatedCombination;
    // Send the updated parentEV back to the FHIR server
    return (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
      body: parentEV,
    })) as EvidenceVariable;
  } catch (error) {
    throw new Error(`Failed to update combination: ${error}`);
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

function mapFormDataToDefinitionExpression(
  expressionData: ExpressionFormData
): any {
  const definitionExpression: any = {
    name: expressionData.expressionName,
    description: expressionData.expressionDescription,
    language: "text/cql-identifier",
    expression: expressionData.selectedExpression,
    reference: expressionData.selectedLibrary?.url,
  };
  // If a criteriaValue and selectedParameter are provided, add the extension
  if (expressionData.criteriaValue && expressionData.selectedParameter) {
    definitionExpression.extension = [];
    const paramExtension: any = {
      url: "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-EVParametrisation",
      extension: [
        { url: "name", valueString: expressionData.selectedParameter },
      ],
    };
    // Add the value based on the type
    const criteriaValue = expressionData.criteriaValue;
    switch (criteriaValue.type) {
      case "integer":
        if (criteriaValue.value !== undefined) {
          paramExtension.extension.push({
            url: "value",
            valueInteger: criteriaValue.value,
          });
        }
        break;
      case "boolean":
        if (criteriaValue.value !== undefined) {
          paramExtension.extension.push({
            url: "value",
            valueBoolean: criteriaValue.value,
          });
        }
        break;
      case "datetime":
        if (criteriaValue.value !== undefined) {
          paramExtension.extension.push({
            url: "value",
            valueDateTime: criteriaValue.value,
          });
        }
        break;
      case "coding":
        if (
          criteriaValue.value !== undefined &&
          typeof criteriaValue.value === "object" &&
          "system" in criteriaValue.value &&
          "code" in criteriaValue.value
        ) {
          paramExtension.extension.push({
            url: "value",
            valueCoding: {
              system: criteriaValue.value.system,
              code: criteriaValue.value.code,
            },
          });
        }
        break;
      default:
        console.error(
          "Type of criteriaValue not handled in mapFormDataToDefinitionExpression:",
          criteriaValue.type
        );
    }
    definitionExpression.extension.push(paramExtension);
  }
  return definitionExpression;
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
    // Create the new expression characteristic
    const newCharacteristic: any = {
      name: expressionData.expressionName,
      description: expressionData.expressionDescription,
      exclude: expressionData.exclude,
      definitionExpression: mapFormDataToDefinitionExpression(expressionData),
      linkId: expressionData.expressionId || undefined,
      reference: expressionData.selectedLibrary?.url,
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

/**
 * Update the definition expression of a specific characteristic within an EvidenceVariable
 *
 * @param evidenceVariableId The ID of the EvidenceVariable to update
 * @param expressionData The new expression data to apply
 * @param targetPath The path to the target characteristic
 * @returns The updated EvidenceVariable
 */
async function updateDefinitionExpression(
  evidenceVariableId: string,
  expressionData: ExpressionFormData,
  targetPath: number[]
): Promise<EvidenceVariable> {
  if (!targetPath || targetPath.length === 0) {
    throw new Error("targetPath is required to update an expression");
  }
  try {
    const parentEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
    })) as EvidenceVariable;
    // Navigate to the target characteristic
    const targetCharacteristic = navigateToTargetCharacteristic(
      parentEV,
      targetPath
    );
    // Update the fields of definitionExpression via the utility function
    targetCharacteristic.name = expressionData.expressionName;
    targetCharacteristic.description = expressionData.expressionDescription;
    targetCharacteristic.exclude = expressionData.exclude;
    targetCharacteristic.linkId = expressionData.expressionId || undefined;
    targetCharacteristic.definitionExpression =
      mapFormDataToDefinitionExpression(expressionData);
    return (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
      body: parentEV,
    })) as EvidenceVariable;
  } catch (error) {
    throw new Error(`Failed to update definition expression: ${error}`);
  }
}

/**
 * Get an EvidenceVariable by its ID and return as EvidenceVariableModel
 * @param evidenceVariableId is the ID of the EvidenceVariable to retrieve
 * @returns The EvidenceVariableModel instance
 */
async function getEvidenceVariableById(
  evidenceVariableId: string
): Promise<EvidenceVariableModel> {
  try {
    // Load the EvidenceVariable from the FHIR server
    const evidenceVariable = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
    })) as EvidenceVariable;
    // Convert to EvidenceVariableModel and return
    return new EvidenceVariableModel(evidenceVariable);
  } catch (error) {
    throw new Error(`Failed to get EvidenceVariable by ID: ${error}`);
  }
}

/**
 * To update a characteristic of type definitionCanonical within an EvidenceVariable.
 * @param parentEvidenceVariableId is the ID of the parent EvidenceVariable to update
 * @param targetPath is the path to the target characteristic
 * @param canonicalData is the new canonical data to apply
 * @param originalCanonicalUrl is the original canonical URL
 * @returns the updated EvidenceVariable
 */
async function updateCanonicalCharacteristic(
  parentEvidenceVariableId: string,
  targetPath: number[],
  canonicalData: CanonicalFormData,
  originalCanonicalUrl: string
): Promise<EvidenceVariable> {
  try {
    // Update the referenced EvidenceVariable if an ID is provided
    if (canonicalData.evidenceVariable.id) {
      const originalEV = await getEvidenceVariableById(
        canonicalData.evidenceVariable.id
      );
      await updateEvidenceVariable(
        canonicalData.evidenceVariable.id,
        canonicalData.evidenceVariable,
        originalEV.getFhirResource()
      );
    }
    // Load the parent EvidenceVariable
    const parentEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
    })) as EvidenceVariable;
    // Navigate to the target characteristic
    const targetCharacteristic = navigateToTargetCharacteristic(
      parentEV,
      targetPath
    );
    // Check if it's a definitionCanonical characteristic
    if (!targetCharacteristic.definitionCanonical) {
      throw new Error("Target characteristic is not a definitionCanonical");
    }
    // Update the properties of the characteristic
    targetCharacteristic.exclude = canonicalData.exclude;
    targetCharacteristic.description =
      canonicalData.evidenceVariable.description;
    targetCharacteristic.linkId = canonicalData.evidenceVariable.identifier;
    // Update the canonical URL if it has changed
    if (canonicalData.evidenceVariable.url !== originalCanonicalUrl) {
      targetCharacteristic.definitionCanonical =
        canonicalData.evidenceVariable.url;
    }
    // Save the updated parent EvidenceVariable
    return (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: parentEvidenceVariableId,
      body: parentEV,
    })) as EvidenceVariable;
  } catch (error) {
    throw new Error(`Failed to update canonical characteristic: ${error}`);
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
  updateDefinitionByCombination,
  addExistingCanonical,
  addNewCanonical,
  addDefinitionExpression,
  updateDefinitionExpression,
  getEvidenceVariableById,
  updateCanonicalCharacteristic,
};

export default EvidenceVariableService;
