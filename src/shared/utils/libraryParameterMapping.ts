import { InclusionCriteriaTypes } from "../../features/StudyDetails/types/evidenceVariable.types";

/**
 * Maps FHIR Library parameter types to UI inclusion criteria types
 */
export const getUITypeFromLibraryParameter = (
  libraryParameterType: string
): InclusionCriteriaTypes => {
  switch (libraryParameterType.toLowerCase()) {
    case "datetime":
    case "date":
    case "period":
      return "date";
    case "coding":
    case "codeableconcept":
      return "code";
    case "integer":
    case "decimal":
      return "integer";
    case "boolean":
      return "boolean";
    default:
      return "boolean";
  }
};