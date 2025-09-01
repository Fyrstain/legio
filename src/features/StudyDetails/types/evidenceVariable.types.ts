import { LibraryReference } from "./library.types";

/**
 * Interface to display object of an EvidenceVariable
 */
interface EvidenceVariableProps {
  title: string;
  description: string;
  id?: string;
  status?: string;
  identifier?: string;
  isExcluded?: boolean;
  characteristicDescription?: string;
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
 * Interface for the props of the EvidenceVariableSection component
 */
interface EvidenceVariableSectionProps {
  evidenceVariables: EvidenceVariableProps[];
  type: "inclusion" | "study";
}

/**
 * Type for the type of EvidenceVariable
 */
type EvidenceVariableType = "inclusion" | "study";

/**
 * Type to distinguish between the three types of forms
 *
 * firstGroup = EvidenceVariable header
 * inclusionCriteria = Inclusion Criteria simple
 * subGroup = Subgroup created in the EV header
 */
type EvidenceVariableFormType = "firstGroup" | "inclusionCriteria" | "subGroup";

/**
 * Type for the Modal mode
 */
type ModalMode = "create" | "update";

/**
 * Type for the logic type of EvidenceVariable
 */
type EvidenceVariableLogicType = "XOR" | "OR" | "AND";

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
  EvidenceVariableSectionProps,
  EvidenceVariableType,
  EvidenceVariableFormType,
  ModalMode,
  EvidenceVariableLogicType,
  InclusionCriteriaTypes,
  IntegerOperatorType,
  DateOperatorType,
  CodeOperatorType,
  InclusionCriteriaValue,
};
