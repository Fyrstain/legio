/**
 * Interface for Library parameter from FHIR ParameterDefinition
 */
interface LibraryParameter {
  name: string;
  use: "in" | "out";
  type: string;
  documentation?: string;
  min?: number;
  max?: string;
}

/**
 * Interface for Library reference (minimal info for selection)
 */
interface LibraryReference {
  id: string;
  name: string;
  url?: string;
}

////////////////////////////
//        Exports         //
////////////////////////////

export type {
  LibraryParameter,
  LibraryReference,
};