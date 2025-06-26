/**
 * Interface to display object of an EvidenceVariable
 */
export interface EvidenceVariableProps {
    title: string;
    description: string;
    expression?: string;
    id?: string;
    status?: string;
  }

/**
 * Interface for the props of the EvidenceVariableSection component
 */
export interface EvidenceVariableSectionProps {
  evidenceVariables: EvidenceVariableProps[];
  type: "inclusion" | "study";
}

/**
 * Type for the type of EvidenceVariable
 */
export type EvidenceVariableType = "inclusion" | "study";