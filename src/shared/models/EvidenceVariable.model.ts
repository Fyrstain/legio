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
   * A static method to create EvidenceVariableModel instances from a FHIR Bundle
   * This method extracts EvidenceVariable resources from the bundle and creates models.
   * 
   * @param bundle is a FHIR Bundle containing EvidenceVariable resources
   * @returns An object containing an array of EvidenceVariableModel instances and an array of canonical URLs
   */
  static fromBundle(bundle: Bundle): { 
    models: EvidenceVariableModel[], 
    canonicalUrls: string[] 
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
  static fromCanonicalBundles(canonicalResults: Bundle[]): EvidenceVariableModel[] {
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
      expression: this.getExpression(),
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