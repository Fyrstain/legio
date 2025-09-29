// Resources
import { Library, ParameterDefinition, Bundle } from "fhir/r5";
// Types
import {
  LibraryParameter,
  LibraryReference,
} from "../../features/StudyDetails/types/library.types";

/**
 * Class representing a FHIR Library resource
 * This class provides methods to access properties of the Library resource
 * and convert it to a display object for use in React components.
 */
export class LibraryModel {
  private readonly fhirResource: Library;

  /**
   * Constructor for LibraryModel
   *
   * @param fhirResource is an instance of Library from FHIR R5
   * This constructor initializes the model with a FHIR Library resource.
   */
  constructor(fhirResource: Library) {
    this.fhirResource = fhirResource;
  }

  /**
   * Get the ID of the Library resource
   *
   * @returns The ID of the Library resource, or undefined if not present
   */
  getId(): string | undefined {
    return this.fhirResource.id;
  }

  /**
   * Get the title of the Library resource
   *
   * @returns The title of the Library resource, or an empty string if not present
   */
  getTitle(): string | undefined {
    return this.fhirResource.title ?? "";
  }

  /**
   * Get the name of the Library resource
   *
   * @returns The name of the Library resource, or an empty string if not present
   */
  getName(): string | undefined {
    return this.fhirResource.name ?? "";
  }

  /**
   * Get the URL of the Library resource
   *
   * @returns The URL of the Library resource, or an empty string if not present
   */
  getUrl(): string | undefined {
    return this.fhirResource.url ?? "";
  }

  /**
   * Get all parameters from the library
   * @returns array of FHIR ParameterDefinition
   */
  getParameters(): ParameterDefinition[] {
    return this.fhirResource.parameter || [];
  }

  /**
   * Get parameters converted to LibraryParameter format
   * @returns array of LibraryParameter
   */
  getLibraryParameters(): LibraryParameter[] {
    return this.getParameters().map((param) => ({
      name: param.name ?? "",
      use: param.use as "in" | "out",
      type: param.type ?? "",
      documentation: param.documentation,
      min: param.min,
      max: param.max,
    }));
  }

  /**
   * Get boolean expressions for inclusion criteria - use="out" and type="boolean"
   * @returns array of boolean expressions for inclusion criteria
   */
  getBooleanExpressions(): LibraryParameter[] {
    return this.getLibraryParameters().filter(
      (param) => param.use === "out" && param.type === "boolean"
    );
  }

  /**
   * Get output parameters (expressions) - use="out" and type="boolean"
   * @returns array of boolean expressions
   */
  getExpressions(): LibraryParameter[] {
    return this.getLibraryParameters().filter((param) => param.use === "out");
  }

  /**
   * Get input parameters - use="in"
   * @returns array of input parameters
   */
  getInputParameters(): LibraryParameter[] {
    return this.getLibraryParameters().filter((param) => param.use === "in");
  }

  /**
   * Get all output parameters (not filtered by type)
   * @returns array of output parameters
   */
  getOutputParameters(): LibraryParameter[] {
    return this.getLibraryParameters().filter((param) => param.use === "out");
  }

  /**
   * Convert a FHIR Bundle to an array of LibraryModel instances
   *
   * @param bundle The FHIR Bundle to convert
   * @returns An array of LibraryModel instances
   */
  static fromBundle(bundle: Bundle): LibraryModel[] {
    if (!bundle.entry) {
      return [];
    }
    return bundle.entry.map((entry) => {
      const library = entry.resource as Library;
      return new LibraryModel(library);
    });
  }

  /**
   * Create a LibraryModel from a single Library resource
   *
   * @param library FHIR Library resource
   * @returns LibraryModel instance
   */
  static fromResource(library: Library): LibraryModel {
    return new LibraryModel(library);
  }

  /**
   * Convert to display object for React components
   *
   * @returns object with display-friendly properties
   */
  toDisplayObject() {
    return {
      id: this.getId(),
      title: this.getTitle(),
      name: this.getName(),
      url: this.getUrl(),
      parameters: this.getInputParameters(), 
      expressions: this.getExpressions(),
    };
  }

  /**
   * Convert to display object for LibraryReference
   *
   * @returns LibraryReference
   */
  toDisplayLibraryReference(): LibraryReference {
    return {
      id: this.getId() ?? "",
      name: this.getName() ?? "",
      url: this.getUrl() ?? "",
    };
  }
}
