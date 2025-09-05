import { LibraryReference } from "./library.types";

/**
 * Interface to display object of an EvidenceVariable
 */
interface EvidenceVariableProps {
  title: string;
  description: string;
  id?: string;
  identifier?: string;
  status?: string;
  url?: string;
  isExcluded?: boolean;
  characteristicDescription?: string;
  hasCharacteristic?: boolean;
  libraryUrl?: string;
}

/**
 * Interface for form state during modal interaction
 * Contains UI-specific fields that don't belong to EvidenceVariable directly
 */
interface EvidenceVariableFormData {
  selectedLibrary?: LibraryReference;
  selectedExpression?: string;
  selectedParameter?: string;
  selectedComparator?: string;
  criteriaValue?: InclusionCriteriaValue;
}

/**
 * Type for the form data used in the EvidenceVariable form
 */
type FormEvidenceVariableData = EvidenceVariableProps &
  EvidenceVariableFormData;

/**
 * Interface for the props of the EvidenceVariableSection component
 */
interface EvidenceVariableSectionProps {
  evidenceVariables: EvidenceVariableProps[];
  type: "inclusion" | "study";
}

/**
 * Type for the inclusion criteria types
 */
type InclusionCriteriaTypes = "boolean" | "integer" | "date" | "code";

/**
 * Type for the operator types for different criteria
 */
type IntegerOperatorType =
  | "equals"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "between";

/**
 * Type for the operator types for date criteria
 */
type DateOperatorType = "equals" | "before" | "after" | "between";

/**
 * Type for the operator types for the codes in the ValueSets
 */
type CodeOperatorType = "equals" | "notEquals" | "in" | "notIn";

/**
 * Interface for the value of the Inclusion Criteria
 */
interface InclusionCriteriaValue {
  type: InclusionCriteriaTypes;
  operator?: IntegerOperatorType | DateOperatorType | CodeOperatorType;
  value?: number | boolean | string | Date | string[];
  minValue?: number | Date;
  maxValue?: number | Date;
  valueSetUrl?: string;
}

////////////////////////////
//        Exports         //
////////////////////////////

export type {
  EvidenceVariableProps,
  EvidenceVariableFormData,
  FormEvidenceVariableData,
  EvidenceVariableSectionProps,
  InclusionCriteriaTypes,
  IntegerOperatorType,
  DateOperatorType,
  CodeOperatorType,
  InclusionCriteriaValue,
};
