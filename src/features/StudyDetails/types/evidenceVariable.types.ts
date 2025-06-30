/**
 * Interface to display object of an EvidenceVariable
 */
interface EvidenceVariableProps {
  title: string;
  description: string;
  expression?: string;
  id?: string;
  status?: string;
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
 * Interface for the value of the Inclusion Criteria
 */
interface InclusionCriteriaValue {
  type: InclusionCriteriaTypes;
  operator?: IntegerOperatorType | DateOperatorType;
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
  EvidenceVariableSectionProps,
  EvidenceVariableType,
  ModalMode,
  EvidenceVariableLogicType,
  InclusionCriteriaTypes,
  IntegerOperatorType,
  DateOperatorType,
  InclusionCriteriaValue,
};
