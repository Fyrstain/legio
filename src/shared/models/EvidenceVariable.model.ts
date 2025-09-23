// Resource
import { Bundle, EvidenceVariable } from "fhir/r5";
// Types
import { EvidenceVariableProps } from "../../features/StudyDetails/types/evidenceVariable.types";

/**
 * Class representing a FHIR EvidenceVariable resource
 * This class provides methods to access properties of the EvidenceVariable resource
 * and convert it to a display object for use in React components.
 */
export class EvidenceVariableModel {
  private readonly fhirResource: EvidenceVariable;

  /**
   * Constructor for EvidenceVariableModel
   *
   * @param fhirResource is an instance of EvidenceVariable from FHIR R5
   * This constructor initializes the model with a FHIR EvidenceVariable resource.
   */
  constructor(fhirResource: EvidenceVariable) {
    this.fhirResource = fhirResource;
  }

  /**
   * To get the ID of the EvidenceVariable
   *
   * @returns The ID of the EvidenceVariable, or undefined if not set
   */
  getId(): string | undefined {
    return this.fhirResource.id;
  }

  /**
   * To get the title of the EvidenceVariable
   *
   * @returns a string representing the title of the EvidenceVariable
   */
  getTitle(): string {
    return this.fhirResource.title ?? "";
  }

  /**
   * To get the description of the EvidenceVariable
   *
   * @returns  a string representing the description of the EvidenceVariable
   */
  getDescription(): string {
    return this.fhirResource.description ?? "";
  }

  /**
   * To get the identifier of the EvidenceVariable
   *
   * @returns The identifier of the EvidenceVariable, or undefined if not set
   */
  getIdentifier(): string | undefined {
    return this.fhirResource.identifier?.[0]?.value;
  }

  /**
   * To get the status of the EvidenceVariable
   *
   * @returns The status of the EvidenceVariable, or undefined if not set
   */
  getStatus(): string | undefined {
    return this.fhirResource.status;
  }

  /**
   * To get the URL of the EvidenceVariable
   *
   * @returns The URL of the EvidenceVariable, or undefined if not set
   */
  getUrl(): string | undefined {
    return this.fhirResource.url;
  }

  /**
   * To get the exclude flag of the EvidenceVariable
   *
   * @returns The exclude flag of the EvidenceVariable, or undefined if not set
   */
  getExclude(): boolean | undefined {
    if (!this.fhirResource.characteristic) {
      return undefined;
    }
    for (const characteristic of this.fhirResource.characteristic) {
      if (characteristic.exclude) {
        return characteristic.exclude;
      }
    }
    return undefined;
  }

  /**
   * Get the library from cqf-library extension
   */
  getLibraryUrl(): string | undefined {
    const extension = this.fhirResource.extension?.find(
      (ext) => ext.url === "http://hl7.org/fhir/StructureDefinition/cqf-library"
    );
    return extension?.valueCanonical;
  }

  /**
   * Gets the characteristic description from the EvidenceVariable, used for the subGroup description
   *
   * @returns The characteristic description, or undefined if not set
   */
  getCharacteristicDescription(): string | undefined {
    if (!this.fhirResource.characteristic) {
      return undefined;
    }
    for (const characteristic of this.fhirResource.characteristic) {
      if (characteristic.description) {
        return characteristic.description;
      }
    }
    return undefined;
  }

  /**
   * Extracts the expression from the EvidenceVariable
   *
   * @returns a string representing the expression, or undefined if not found
   */
  getExpression(): string | undefined {
    if (!this.fhirResource.characteristic) {
      return undefined;
    }
    for (const characteristic of this.fhirResource.characteristic) {
      if (characteristic.definitionExpression?.expression) {
        return characteristic.definitionExpression.expression;
      }
    }
    return undefined;
  }

  /**
   * To get all characteristics of the EvidenceVariable
   *
   * @returns All characteristics of the EvidenceVariable, or an empty array if none are set
   */
  getCharacteristics(): any[] {
    return this.fhirResource.characteristic || [];
  }

  /**
   * To get the first characteristic of the EvidenceVariable
   *
   * @returns The first characteristic of the EvidenceVariable, or undefined if not set
   */
  getCharacteristic(): any | undefined {
    return this.fhirResource.characteristic?.[0];
  }

  /**
   * To check if the EvidenceVariable has any characteristics
   *
   * @returns True if the EvidenceVariable has characteristics, false otherwise
   */
  hasCharacteristic(): boolean {
    return !!(
      this.fhirResource.characteristic &&
      this.fhirResource.characteristic.length > 0
    );
  }

  /**
   * To check if the EvidenceVariable has at least one characteristic with definitionByCombination
   * @returns True if the EvidenceVariable has at least one characteristic with definitionByCombination, false otherwise
   */
  hasDefinitionByCombination(): boolean {
    return (
      this.fhirResource.characteristic?.some(
        (char) => !!char.definitionByCombination
      ) ?? false
    );
  }
  
  /**
   * Get the underlying FHIR resource
   * @returns The FHIR EvidenceVariable resource
   */
  getFhirResource(): EvidenceVariable {
    return this.fhirResource;
  }

  /**
   * A static method to create EvidenceVariableModel instances from a FHIR Bundle
   * This method extracts EvidenceVariable resources from the bundle and creates models.
   *
   * @param bundle is a FHIR Bundle containing EvidenceVariable resources
   * @returns An object containing an array of EvidenceVariableModel instances and an array of canonical URLs
   */
  static fromBundle(bundle: Bundle): {
    models: EvidenceVariableModel[];
    canonicalUrls: string[];
  } {
    const models: EvidenceVariableModel[] = [];
    const canonicalUrls: string[] = [];
    // To extract canonical URLs from EvidenceVariable characteristics
    if (bundle.entry) {
      bundle.entry.forEach((entry) => {
        if (entry.resource?.resourceType === "EvidenceVariable") {
          const evidenceVariable = entry.resource as EvidenceVariable;
          evidenceVariable.characteristic?.forEach((characteristic) => {
            if (characteristic.definitionByCombination?.characteristic) {
              characteristic.definitionByCombination.characteristic.forEach(
                (subCharacteristic) => {
                  if (subCharacteristic.definitionCanonical) {
                    canonicalUrls.push(subCharacteristic.definitionCanonical);
                  }
                }
              );
            }
          });
        }
      });
    }
    // If no canonical URLs were found, use the original bundle entries
    // TODO : We'll need to delete this part for the V1 when the canonical URLs will be always present
    if (canonicalUrls.length === 0 && bundle.entry) {
      bundle.entry.forEach((entry) => {
        if (entry.resource?.resourceType === "EvidenceVariable") {
          const evidenceVariable = entry.resource as EvidenceVariable;
          models.push(new EvidenceVariableModel(evidenceVariable));
        }
      });
    }
    // If canonical URLs were found, create models from them
    return { models, canonicalUrls };
  }

  /**
   * A static method to create EvidenceVariableModel instances from an array of FHIR Bundles
   *
   * @param canonicalResults is an array of FHIR Bundles containing EvidenceVariable resources
   * @returns a list of EvidenceVariableModel instances
   */
  static fromCanonicalBundles(
    canonicalResults: Bundle[]
  ): EvidenceVariableModel[] {
    const models: EvidenceVariableModel[] = [];
    // Iterate through each bundle to extract EvidenceVariable resources
    canonicalResults.forEach((result) => {
      if (result.entry?.[0]?.resource?.resourceType === "EvidenceVariable") {
        const evidenceVariable = result.entry[0].resource as EvidenceVariable;
        models.push(new EvidenceVariableModel(evidenceVariable));
      }
    });
    // Return the list of models created from the bundles
    return models;
  }

  /**
   * Converts the EvidenceVariable to a display object
   *
   * @returns An object containing the title, description, status, expression, and ID of the EvidenceVariable
   */
  toDisplayObject(): EvidenceVariableProps {
    return {
      id: this.getId(),
      title: this.getTitle(),
      description: this.getDescription(),
      identifier: this.getIdentifier(),
      status: this.getStatus(),
      url: this.getUrl(),
      isExcluded: this.getExclude(),
      characteristicDescription: this.getCharacteristicDescription(),
      hasCharacteristic: this.hasCharacteristic(),
      libraryUrl: this.getLibraryUrl(),
      selectedExpression: this.getExpression(),
    };
  }
}

/**
 * Utility class for handling EvidenceVariable models
 */
export class EvidenceVariableUtils {
  /**
   * Extracts non-null expressions from an array of EvidenceVariableModel
   * This method filters out any EvidenceVariableModel instances that do not have a valid expression.
   * @param studyVariables Array of EvidenceVariableModel instances
   * @returns Array of strings representing the expressions
   */
  static extractExpressions(studyVariables: EvidenceVariableModel[]): string[] {
    return studyVariables
      .map((variable) => variable.getExpression())
      .filter((expression): expression is string => !!expression);
  }

  /**
   * Converts an array of EvidenceVariableModel to an array of display objects
   * @param evidenceVariables Array of EvidenceVariableModel instances
   * @returns Array of EvidenceVariableDisplayObject
   */
  static toDisplayObjects(
    evidenceVariables: EvidenceVariableModel[]
  ): EvidenceVariableProps[] {
    return evidenceVariables.map((ev) => ev.toDisplayObject());
  }
}
