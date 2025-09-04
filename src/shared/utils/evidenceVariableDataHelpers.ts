// Types
import {
  EvidenceVariableProps,
  EvidenceVariableFormData,
} from "../../features/StudyDetails/types/evidenceVariable.types";

/**
 * Extracts the data needed for a FirstGroup EvidenceVariable
 */
export const getFirstGroupData = (
  evidenceVariableData: EvidenceVariableProps,
  formData: EvidenceVariableFormData
) => {
  return {
    id: evidenceVariableData.id,
    title: evidenceVariableData.title,
    description: evidenceVariableData.description,
    identifier: evidenceVariableData.identifier,
    status: evidenceVariableData.status,
    selectedLibrary: formData.selectedLibrary,
  };
};

/**
 * Extracts the data needed for a SubGroup EvidenceVariable
 */
export const getSubGroupData = (
  evidenceVariableData: EvidenceVariableProps,
  formData: EvidenceVariableFormData
) => {
  return {
    id: evidenceVariableData.id,
    title: evidenceVariableData.title,
    description: evidenceVariableData.description,
    identifier: evidenceVariableData.identifier,
    status: evidenceVariableData.status,
    characteristicDescription: evidenceVariableData.characteristicDescription,
    selectedLibrary: formData.selectedLibrary,
    selectedExpression: formData.selectedExpression,
    selectedParameter: formData.selectedParameter,
    criteriaValue: formData.criteriaValue,
  };
};

/**
 * Extracts the data needed for an InclusionCriteria EvidenceVariable
 */
export const getInclusionCriteriaData = (
  evidenceVariableData: EvidenceVariableProps,
  formData: EvidenceVariableFormData
) => {
  return {
    id: evidenceVariableData.id,
    title: evidenceVariableData.title,
    description: evidenceVariableData.description,
    identifier: evidenceVariableData.identifier,
    status: evidenceVariableData.status,
    isExcluded: evidenceVariableData.isExcluded,
    selectedLibrary: formData.selectedLibrary,
    selectedExpression: formData.selectedExpression,
    selectedParameter: formData.selectedParameter,
    criteriaValue: formData.criteriaValue,
  };
};
