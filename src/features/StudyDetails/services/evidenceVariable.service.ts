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

const MAX_CANONICAL_DEPTH = 5;

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirKnowledgeClient = new Client({
  baseUrl: process.env.REACT_APP_KNOWLEDGE_URL ?? "fhir",
});

/**
 * Load all EvidenceVariables from the FHIR server.
 * @param filterByActual Optional filter to load only actual=true or actual=false EvidenceVariables
 * @returns A promise of an array of EvidenceVariableModel instances
 */
async function loadAllEvidenceVariables(
  filterByActual?: boolean
): Promise<EvidenceVariableModel[]> {
  try {
    const bundle = (await fhirKnowledgeClient.search({
      resourceType: "EvidenceVariable",
      searchParams: { _count: 10000 },
    })) as Bundle;
    // Map the Bundle entries to EvidenceVariableModel instances
    let models =
      bundle.entry?.map(
        (entry) => new EvidenceVariableModel(entry.resource as EvidenceVariable)
      ) || [];
    // Filter by actual if specified
    if (filterByActual === false) {
      models = models.filter((model) => model.getActual() === false);
    } else if (filterByActual === true) {
      models = models.filter((model) => model.getActual() === true);
    }
    return models;
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
  try {
    if (type === "inclusion") {
      // Existing inclusion logic stays as-is
      const study = await StudyService.loadStudy(studyId);
      const eligibilityRef = study.recruitment?.eligibility?.reference;
      if (!eligibilityRef) return [];

      const evId = eligibilityRef.replace("EvidenceVariable/", "");
      const root = (await fhirKnowledgeClient.read({
        resourceType: "EvidenceVariable",
        id: evId,
      })) as EvidenceVariable;

      const all = await resolveCanonicalsRecursive([root]);
      return dedupeEVs(all).map((ev) => new EvidenceVariableModel(ev));
    }

    // type === "study"
    // 1) Load Study
    const study = await StudyService.loadStudy(studyId);

    // 2) Find EXT-Datamart and collect variable references
    const datamartExtension = study.extension?.find(
      (ext) =>
        ext.url === "https://www.isis.com/StructureDefinition/EXT-Datamart"
    );

    if (!datamartExtension?.extension?.length) return [];

    const baseRefs = datamartExtension.extension
      .filter((subExtension) => subExtension.url === "variable" && subExtension.valueReference?.reference)
      .map((subExtension) => subExtension.valueReference!.reference as string); // e.g., "EvidenceVariable/123"

    if (baseRefs.length === 0) return [];

    // 3) Read the root EVs from references
    const roots = (
      await Promise.all(
        baseRefs.map(async (ref) => {
          const id = ref.includes("/") ? ref.split("/")[1] : ref;
          try {
            return (await fhirKnowledgeClient.read({
              resourceType: "EvidenceVariable",
              id,
            })) as EvidenceVariable;
          } catch {
            return null;
          }
        })
      )
    ).filter(Boolean) as EvidenceVariable[];

    if (roots.length === 0) return [];

    // 4) Resolve canonical chains (definitionCanonical) recursively
    const all = await resolveCanonicalsRecursive(roots);

    // 5) Dedup + map to models
    return dedupeEVs(all)
      .map((ev) => new EvidenceVariableModel(ev));
  } catch (error) {
    throw new Error("Error loading evidence variables: " + error);
  }
}

/**
 * Removes duplicate EvidenceVariable resources.
 *
 * @param {EvidenceVariable[]} list - Input array that may contain duplicates.
 * @returns {EvidenceVariable[]} A new array with duplicates removed.
 */
function dedupeEVs(list: EvidenceVariable[]): EvidenceVariable[] {
  const map = new Map<string, EvidenceVariable>();
  for (const ev of list) {
    const key = ev.url || ev.id || JSON.stringify(ev);
    if (!map.has(key)) map.set(key, ev);
  }
  return Array.from(map.values());
}

/**
 * Collects all canonical references from an EvidenceVariable.
 *
 * @param {EvidenceVariable} ev - The source EvidenceVariable.
 * @returns {string[]} Unique canonical URLs.
 */
function extractCanonicals(ev: EvidenceVariable): string[] {
  const out: string[] = [];
  ev.characteristic?.forEach((ch) => {
    if (ch.definitionCanonical) out.push(ch.definitionCanonical);
    const combo = ch.definitionByCombination?.characteristic ?? [];
    combo.forEach((sub) => {
      if (sub.definitionCanonical) out.push(sub.definitionCanonical);
    });
  });
  return Array.from(new Set(out));
}

/**
 * Fetches an EvidenceVariable by canonical URL using the knowledge client.
 *
 * @param {string} canonical - Canonical URL.
 * @returns {Promise<EvidenceVariable|null>} The resolved EV.
 */
async function fetchEVByCanonical(
  canonical: string
): Promise<EvidenceVariable | null> {
  try {
    const [url, version] = canonical.split("|");
    const bundle = (await fhirKnowledgeClient.search({
      resourceType: "EvidenceVariable",
      searchParams: version ? { url, version } : { url },
    })) as Bundle;

    const entry = bundle.entry?.find(
      (e) => e.resource?.resourceType === "EvidenceVariable"
    );
    return (entry?.resource as EvidenceVariable) ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolves all EvidenceVariables reachable via canonical references, recursively.F
 *
 * @param {EvidenceVariable[]} seed - Starting EVs.
 * @param {number} [depth=0] - Current recursion depth.
 * @param {Set<string>} [seen=new Set()] - Keys of already visited EVs.
 * @returns {Promise<EvidenceVariable[]>} Deduplicated list of EVs.
 */
async function resolveCanonicalsRecursive(
  seed: EvidenceVariable[],
  depth = 0,
  seen = new Set<string>()
): Promise<EvidenceVariable[]> {
  if (depth > MAX_CANONICAL_DEPTH || seed.length === 0) return dedupeEVs(seed);

  const nextCanonicals: string[] = [];
  const acc: EvidenceVariable[] = [];

  for (const ev of seed) {
    const key = ev.url || ev.id || JSON.stringify(ev);
    if (seen.has(key)) continue;
    seen.add(key);
    acc.push(ev);
    nextCanonicals.push(...extractCanonicals(ev));
  }

  const uniqueCanonicals = Array.from(new Set(nextCanonicals));
  const fetched = (
    await Promise.all(uniqueCanonicals.map((c) => fetchEVByCanonical(c)))
  ).filter(Boolean) as EvidenceVariable[];

  if (fetched.length === 0) return dedupeEVs(acc);

  const rec = await resolveCanonicalsRecursive(fetched, depth + 1, seen);
  return dedupeEVs([...acc, ...rec]);
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
  data: FormEvidenceVariableData,
  selectedExpression?: string
): Promise<EvidenceVariable> {
  const evidenceVariable = mapFormDataToEvidenceVariable(data);
  // New EVs are always actual=true
  evidenceVariable.actual = true;
  // Add expression characteristic if provided (for study variables only when we need to add a new definitionCanonical)
  if (selectedExpression && data.selectedLibrary) {
    evidenceVariable.characteristic = [
      {
        description: `Expression: ${selectedExpression}`,
        definitionExpression: {
          description: `Expression: ${selectedExpression}`,
          name: selectedExpression,
          language: "text/cql-identifier",
          expression: selectedExpression,
          reference: data.selectedLibrary.url,
        },
      },
    ];
  }
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
    // If an expression is provided, update or add the definitionExpression characteristic
    if (updatedData.selectedExpression && updatedData.selectedLibrary) {
      // Find or create the characteristic with definitionExpression
      if (!updatedEV.characteristic) updatedEV.characteristic = [];
      // Look for existing definitionExpression characteristic
      let exprIndex = updatedEV.characteristic.findIndex(
        (characteristic) => characteristic.definitionExpression
      );
      const exprChar = {
        description: `Expression: ${updatedData.selectedExpression}`,
        definitionExpression: {
          name: updatedData.selectedExpression,
          language: "text/cql-identifier",
          expression: updatedData.selectedExpression,
          reference: updatedData.selectedLibrary.url,
        },
      };
      // Update or add the characteristic
      if (exprIndex >= 0) {
        updatedEV.characteristic[exprIndex] = exprChar;
      } else {
        updatedEV.characteristic.push(exprChar);
      }
    }
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
        url: "https://www.isis.com/StructureDefinition/EXT-Exclusive-OR",
        valueBoolean: true,
      },
    ];
  } else {
    // Remove the extension if it existed before
    combination.definitionByCombination.extension =
      combination.definitionByCombination.extension?.filter(
        (ext: { url: string }) =>
          ext.url !==
          "https://www.isis.com/StructureDefinition/EXT-Exclusive-OR"
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
  targetPath?: number[],
  selectedExpression?: string
): Promise<EvidenceVariable> {
  try {
    // 1. Create the new EvidenceVariable with optional expression
    const newEV = await createSimpleEvidenceVariable(
      newEVData,
      selectedExpression
    );
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
      url: "https://www.isis.com/StructureDefinition/EXT-EVParametrisation",
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
  console.log("updateCanonicalCharacteristic - Received data:", {
    selectedExpression: canonicalData.selectedExpression,
    evidenceVariableId: canonicalData.evidenceVariable.id,
    canonicalData,
  });
  try {
    // Update the referenced EvidenceVariable if an ID is provided
    if (canonicalData.evidenceVariable.id) {
      const originalEV = await getEvidenceVariableById(
        canonicalData.evidenceVariable.id
      );
      await updateEvidenceVariable(
        canonicalData.evidenceVariable.id,
        {
          ...canonicalData.evidenceVariable,
          selectedExpression: canonicalData.selectedExpression,
        },
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

/**
 * Generate a simple unique identifier using timestamp + random string
 * @returns A unique identifier string
 */
function generateSimpleId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a copy of an existing EvidenceVariable with actual=true
 * This is used when adding a definitionCanonical - we copy the referenced EV and set actual=true
 * @param originalEvidenceVariableId The ID of the original EV to copy
 * @returns The created copy with actual=true
 */
async function copyEvidenceVariableWithActualTrue(
  originalEvidenceVariableId: string
): Promise<EvidenceVariable> {
  try {
    // Load the original EvidenceVariable
    const originalEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: originalEvidenceVariableId,
    })) as EvidenceVariable;
    // Generate a simple unique ID
    const uniqueId = generateSimpleId();
    // Create new URL by appending the unique ID to the original URL
    const newUrl = `${originalEV.url}/${uniqueId}`;
    // Create a copy with the new URL and actual=true
    const copiedEV: EvidenceVariable = {
      ...originalEV,
      // Remove ID to let the server assign a new one
      id: undefined,
      // Set actual=true for the copy
      actual: true,
      // Assign the new unique URL
      url: newUrl,
    };
    // Create the new EvidenceVariable
    const createdEV = (await fhirKnowledgeClient.create({
      resourceType: "EvidenceVariable",
      body: copiedEV,
    })) as EvidenceVariable;
    return createdEV;
  } catch (error) {
    throw new Error(`Failed to copy EvidenceVariable: ${error}`);
  }
}

/**
 * To add an existing canonical criteria to an EvidenceVariable with copying.
 * This creates a copy of the referenced EV with actual=true for parameterization.
 *
 * @param parentEvidenceVariableId The ID of the parent EvidenceVariable to update.
 * @param referencedEVId The ID of the EV to be copied and referenced.
 * @param exclude Whether this canonical should be excluded.
 * @param targetPath Optional path to the target combination within the parent EvidenceVariable.
 * @returns The updated parent EvidenceVariable.
 */
async function addExistingCanonicalWithCopy(
  parentEvidenceVariableId: string,
  referencedEVId: string,
  exclude: boolean = false,
  targetPath?: number[]
): Promise<EvidenceVariable> {
  try {
    // 1. Create a copy of the referenced EV with actual=true
    const copiedEV = await copyEvidenceVariableWithActualTrue(referencedEVId);
    // 2. Create canonical data using the copied EV
    const canonicalData: ExistingCanonicalFormData = {
      exclude: exclude,
      canonicalUrl: copiedEV.url!,
      canonicalId: copiedEV.identifier?.[0]?.value,
      canonicalDescription: copiedEV.description,
    };
    // 3. Add this copied EV as definitionCanonical to the parent EV
    const updatedParentEV = await addExistingCanonical(
      parentEvidenceVariableId,
      canonicalData,
      targetPath
    );
    return updatedParentEV;
  } catch (error) {
    throw new Error(`Failed to add existing canonical with copy: ${error}`);
  }
}

/**
 * Update an EvidenceVariable with parameterization
 * This adds or updates a characteristic.definitionExpression with parameterization
 */
async function updateEvidenceVariableWithParameterization(
  evidenceVariableId: string,
  parameterization: {
    selectedExpression: string;
    selectedParameter: string;
    criteriaValue: any;
    libraryUrl?: string;
  }
): Promise<EvidenceVariable> {
  try {
    // 1. Load the existing EV (the copied one with actual: true)
    const existingEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
    })) as EvidenceVariable;
    // 2. Create the new definitionExpression characteristic
    const newCharacteristic = {
      description: `Expression: ${parameterization.selectedExpression}`,
      definitionExpression: mapFormDataToDefinitionExpression({
        selectedExpression: parameterization.selectedExpression,
        selectedParameter: parameterization.selectedParameter,
        criteriaValue: parameterization.criteriaValue,
        selectedLibrary: parameterization.libraryUrl
          ? { url: parameterization.libraryUrl }
          : undefined,
      } as ExpressionFormData),
    };
    // 3. Add or replace the characteristic
    if (!existingEV.characteristic) {
      existingEV.characteristic = [newCharacteristic];
    } else {
      // Replace existing definitionExpression or add new one
      const exprIndex = existingEV.characteristic.findIndex(
        (char) => char.definitionExpression
      );
      if (exprIndex >= 0) {
        existingEV.characteristic[exprIndex] = newCharacteristic;
      } else {
        existingEV.characteristic.push(newCharacteristic);
      }
    }
    // 4. Update the EV
    return (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
      body: existingEV,
    })) as EvidenceVariable;
  } catch (error) {
    throw new Error(`Failed to update EV with parameterization: ${error}`);
  }
}

/**
 * Update the status of an EvidenceVariable
 * @param evidenceVariableId The ID of the EV to update
 * @param newStatus The new status to set
 * @returns The updated EvidenceVariable
 */
async function updateEvidenceVariableStatus(
  evidenceVariableId: string,
  newStatus: "active" | "retired" | "draft" | "unknown"
): Promise<EvidenceVariable> {
  try {
    // Load the existing EV
    const existingEV = (await fhirKnowledgeClient.read({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
    })) as EvidenceVariable;
    // Update only the status
    existingEV.status = newStatus;
    // Save the updated EV
    return (await fhirKnowledgeClient.update({
      resourceType: "EvidenceVariable",
      id: evidenceVariableId,
      body: existingEV,
    })) as EvidenceVariable;
  } catch (error) {
    throw new Error(`Failed to update EV status: ${error}`);
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
  copyEvidenceVariableWithActualTrue,
  addExistingCanonicalWithCopy,
  updateEvidenceVariableWithParameterization,
  updateEvidenceVariableStatus,
};

export default EvidenceVariableService;
