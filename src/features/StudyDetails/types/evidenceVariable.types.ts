// Model
import { EvidenceVariableModel } from "../../../shared/models/EvidenceVariable.model";
// Types
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
  evidenceVariableModels: EvidenceVariableModel[];
  type: "inclusion" | "study";
  onAction?: (
    actionType: EvidenceVariableActionType,
    path?: number[],
    editData?: any
  ) => void;
  editMode?: boolean;
  onEditEV?: (id: string) => void;
}

/**
 * Type for the inclusion criteria types
 */
type InclusionCriteriaTypes = "boolean" | "integer" | "datetime" | "coding";

/**
 * Interface for the value of the Inclusion Criteria
 */
interface InclusionCriteriaValue {
  type: InclusionCriteriaTypes;
  operator?: string;
  value?:
    | number
    | boolean
    | string
    | Date
    | string[]
    | { system?: string; code?: string };
  minValue?: number | Date;
  maxValue?: number | Date;
  valueSetUrl?: string;
}

/**
 * Interface for combination form data
 */
interface CombinationFormData {
  exclude: boolean;
  code: "all-of" | "any-of" | undefined;
  isXor: boolean;
  combinationId: string;
  combinationDescription?: string;
}

/**
 * Interface for existing canonical criteria form data
 */
interface ExistingCanonicalFormData {
  exclude: boolean;
  canonicalUrl: string;
  canonicalId?: string;
  canonicalDescription?: string;
}

/**
 * Interface for existing canonical criteria form data
 */
interface ExistingCanonicalCriteriaFormData {
  exclude: boolean;
  selectedEvidenceVariable?: FormEvidenceVariableData;
}

/**
 * Interface for canonical form data
 */
interface CanonicalFormData {
  exclude: boolean;
  evidenceVariable: FormEvidenceVariableData;
}

/**
 * Interface for expression form data
 */
interface ExpressionFormData {
  exclude: boolean;
  expressionId: string;
  expressionName: string;
  expressionDescription: string;
  selectedLibrary?: LibraryReference;
  selectedExpression: string;
  selectedParameter: string;
  criteriaValue?: InclusionCriteriaValue;
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
  | "editCanonical"
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
  CombinationFormData,
  ExistingCanonicalFormData,
  ExistingCanonicalCriteriaFormData,
  CanonicalFormData,
  ExpressionFormData,
  EvidenceVariableButtonType,
  EvidenceVariableActionType,
  EvidenceVariableButtonsProps,
};
