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
  onAction?: (actionType: EvidenceVariableActionType) => void;
  editMode?: boolean;
}

/**
 * Type for the inclusion criteria types
 */
type InclusionCriteriaTypes = "boolean" | "integer" | "date" | "code";

/**
 * Interface for the value of the Inclusion Criteria
 */
interface InclusionCriteriaValue {
  type: InclusionCriteriaTypes;
  operator?: string;
  value?: number | boolean | string | Date | string[];
  minValue?: number | Date;
  maxValue?: number | Date;
  valueSetUrl?: string;
}

/**
 * Button type for EvidenceVariableButtons component
 */
type EvidenceVariableButtonType =
  | "criteria"
  | "studyVariable"
  | "characteristic";

/**
 * Action types for evidence variable operations
 */
type EvidenceVariableActionType =
  | "new"
  | "existing"
  | "expression"
  | "combination"
  | "newCanonical"
  | "existingCanonical"
  | "edit";

/**
 * Props for EvidenceVariableButtons component
 */
interface EvidenceVariableButtonsProps {
  buttonType: EvidenceVariableButtonType;
  editMode: boolean;
  onAction: (actionType: EvidenceVariableActionType) => void;
  disabled?: boolean;
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
  InclusionCriteriaValue,
  EvidenceVariableButtonType,
  EvidenceVariableActionType,
  EvidenceVariableButtonsProps,
};
