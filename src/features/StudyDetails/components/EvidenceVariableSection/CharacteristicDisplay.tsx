// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Accordion, Alert, Badge } from "react-bootstrap";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning, faPen } from "@fortawesome/free-solid-svg-icons";
// Types
import { EvidenceVariableActionType } from "../../types/evidenceVariable.types";
// Components
import EvidenceVariableButtons from "../EvidenceVariableButtons/EvidenceVariableButtons";
import ParameterizableEvidenceVariableForm from "../CustomEvidenceVariableModal/Forms/ParameterizableEvidenceVariableForm";
// Front Library
import { Title } from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";
// Services
import EvidenceVariableService from "../../services/evidenceVariable.service";
// Models
import { EvidenceVariableModel } from "../../../../shared/models/EvidenceVariable.model";

/////////////////////////////////
//          Interface        ////
/////////////////////////////////
interface CharacteristicDisplayProps {
  // Array of characteristics to display
  characteristics: any[];
  // Boolean indicating if the component is in edit mode
  editMode: boolean;
  // Optional action handler for evidence variable actions
  onAction?: (
    actionType: EvidenceVariableActionType,
    path?: number[],
    editData?: any
  ) => void;
  // Optional current path in the characteristics hierarchy
  currentPath?: number[];
  // Type of evidence variable (inclusion or study)
  type?: "inclusion" | "study";
  // Indicates if there is an existing combination characteristic
  hasExistingCombination?: boolean;
}

const CharacteristicDisplay: FunctionComponent<CharacteristicDisplayProps> = ({
  characteristics,
  editMode,
  onAction,
  currentPath = [],
  type = "inclusion",
  hasExistingCombination = false,
}) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  // State to manage the canonical EV data for parameterization forms
  const [canonicalEVData, setCanonicalEVData] = useState<{
    [key: string]: any;
  }>({});

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // Load canonical EV data when characteristics change
  useEffect(() => {
    characteristics.forEach((characteristic, index) => {
      if (characteristic.definitionCanonical) {
        loadCanonicalEVData(characteristic.definitionCanonical, index);
      }
    });
  }, [characteristics]);

  ////////////////////////////////
  //           Actions          //
  ////////////////////////////////

  /**
   * Check if the XOR extension is present in the list of extensions.
   * @param extensions is the list of extensions to check for XOR.
   * @returns true if the XOR extension is present, false otherwise.
   */
  function hasXorExtension(extensions?: any[]): boolean {
    if (!extensions) return false;
    return extensions.some(
      (ext) =>
        ext.url ===
          "https://www.isis.com/StructureDefinition/EXT-Exclusive-OR" &&
        ext.valueBoolean === true
    );
  }

  /**
   * Find the logical operator from the code and extensions.
   * @param code is the code of the logical operator (all-of, any-of).
   * @param extensions (optional) is the list of extensions to check for XOR.
   * @returns a string representing the logical operator (AND, OR, XOR, N/A).
   */
  function getLogicalOperatorFromCode(code: string, extensions?: any[]) {
    switch (code) {
      case "all-of":
        return `(${i18n.t("label.and")})`;
      case "any-of":
        if (hasXorExtension(extensions)) {
          return `(${i18n.t("label.xor")})`;
        } else {
          return `(${i18n.t("label.or")})`;
        }
      default:
        return "";
    }
  }

  /**
   * Load canonical EV data for parameterization
   * @param canonicalUrl The URL of the canonical evidence variable
   * @param index The index of the characteristic
   * @returns A promise that resolves when the data is loaded
   */
  const loadCanonicalEVData = async (canonicalUrl: string, index: number) => {
    if (canonicalEVData[index]) {
      return;
    }
    try {
      const canonicalEV =
        await EvidenceVariableService.readEvidenceVariableByUrl(canonicalUrl);
      if (canonicalEV.entry && canonicalEV.entry.length > 0) {
        const referencedEV = canonicalEV.entry[0].resource as any;
        const evModel = new EvidenceVariableModel(referencedEV);
        // Extract current parameter information if it exists
        const characteristic = referencedEV.characteristic?.[0];
        let selectedExpression = "";
        let selectedParameter = "";
        let criteriaValue = undefined;
        // Check if definitionExpression exists
        if (characteristic?.definitionExpression) {
          selectedExpression =
            characteristic.definitionExpression.expression || "";
          // Extract parameterization if it exists
          const paramExtension =
            characteristic.definitionExpression.extension?.find(
              (ext: any) =>
                ext.url ===
                "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-EVParametrisation"
            );
          // If parameterization extension exists, extract name and value
          if (paramExtension) {
            const nameExt = paramExtension.extension?.find(
              (ext: any) => ext.url === "name"
            );
            selectedParameter =
              nameExt?.valueString || nameExt?.valueCode || "";
            // Extract the value and determine the type
            const valueExtension = paramExtension.extension?.find(
              (ext: any) => ext.url === "value"
            );
            if (valueExtension) {
              if (valueExtension.valueInteger !== undefined) {
                criteriaValue = {
                  type: "integer",
                  value: valueExtension.valueInteger,
                };
              } else if (valueExtension.valueBoolean !== undefined) {
                criteriaValue = {
                  type: "boolean",
                  value: valueExtension.valueBoolean,
                };
              } else if (valueExtension.valueDateTime !== undefined) {
                criteriaValue = {
                  type: "datetime",
                  value: new Date(valueExtension.valueDateTime),
                };
              } else if (valueExtension.valueCoding !== undefined) {
                criteriaValue = {
                  type: "coding",
                  value: valueExtension.valueCoding,
                };
              }
            }
          }
        }
        // Prepare the form data
        const formData = {
          title: referencedEV.title || "",
          description: referencedEV.description || "",
          identifier: referencedEV.identifier?.[0]?.value || "",
          status: referencedEV.status || "",
          url: referencedEV.url || "",
          libraryUrl: evModel.getLibraryUrl(),
          selectedExpression,
          selectedParameter,
          criteriaValue,
          id: referencedEV.id,
        };
        // Update state with the loaded data
        setCanonicalEVData((prev) => ({ ...prev, [index]: formData }));
      }
    } catch (error) {
      console.error("Error loading canonical EV data:", error);
    }
  };

  /**
   * Handle saving parameterized data
   * @param index The index of the characteristic
   * @param data The parameterized data to save
   */
  const handleSaveParameterization = async (
    index: number,
    data: {
      selectedExpression: string;
      selectedParameter: string;
      criteriaValue: any;
    }
  ) => {
    try {
      console.log("Saving parameterization:", data);
      const evData = canonicalEVData[index];
      if (!evData || !evData.id) {
        throw new Error("Invalid EV data or ID");
      }
      // Call service to update the EV with parameterization
      await EvidenceVariableService.updateEvidenceVariableWithParameterization(
        evData.id,
        {
          selectedExpression: data.selectedExpression,
          selectedParameter: data.selectedParameter,
          criteriaValue: data.criteriaValue,
          libraryUrl: evData.libraryUrl,
        }
      );
      // Update local state to reflect changes
      setCanonicalEVData((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          selectedExpression: data.selectedExpression,
          selectedParameter: data.selectedParameter,
          criteriaValue: data.criteriaValue,
        },
      }));
      // Notify user of success
      alert(i18n.t("message.updatesuccessful"));
      // Optionally, refresh the page or data to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error saving parameterization:", error);
      alert(`${i18n.t("error.savingparameterization")} ${error}`);
    }
  };

  /**
   * Handles an action for a characteristic.
   * Used to pass to EvidenceVariableButtons component and know the index of the characteristic
   * to build the path in the characteristics tree.
   * @param index is the index of the characteristic in the list.
   * @param actionType is the type of action to perform.
   * @returns a function that handles the action for the characteristic at the given index.
   */
  const handleAction =
    (index: number) => (actionType: EvidenceVariableActionType) => {
      const targetPath = [...currentPath, index];
      onAction?.(actionType, targetPath);
    };

  /**
   * Handles the editing of a combination characteristic.
   * @param characteristic is the characteristic to edit.
   * @param index is the index of the characteristic in the list.
   */
  const handleEditCombination = (characteristic: any, index: number) => {
    // Prepare the data to edit the combination
    const editData = {
      exclude: characteristic.exclude || false,
      code: characteristic.definitionByCombination.code,
      isXor:
        characteristic.definitionByCombination.extension?.some(
          (ext: any) =>
            ext.url ===
              "https://www.isis.com/StructureDefinition/EXT-Exclusive-OR" &&
            ext.valueBoolean === true
        ) || false,
      combinationId: characteristic.linkId || "",
      combinationDescription: characteristic.description || "",
    };
    // Build the path to the characteristic
    const targetPath = [...currentPath, index];
    // Call the onAction handler with the combination action type, path, and edit data
    onAction?.("combination", targetPath, editData);
  };

  /**
   * Handles the editing of an expression characteristic.
   * @param characteristic is the characteristic to edit.
   * @param index is the index of the characteristic in the list.
   */
  const handleEditExpression = (characteristic: any, index: number) => {
    // To extract parameters from extensions
    let selectedParameter = "";
    let criteriaValue = undefined;
    // Find the parameterization extension
    const paramExtension = characteristic.definitionExpression?.extension?.find(
      (ext: any) =>
        ext.url ===
        "https://www.isis.com/StructureDefinition/EXT-EVParametrisation"
    );
    if (paramExtension) {
      // Extract the name of the parameter
      const nameExt = paramExtension.extension?.find(
        (ext: any) => ext.url === "name"
      );
      selectedParameter = nameExt?.valueString || "";
      // Extract the value and determine the type
      const valueExtension = paramExtension.extension?.find(
        (ext: any) => ext.url === "value"
      );
      // Determine the type of the value
      if (valueExtension) {
        if (valueExtension.valueInteger !== undefined) {
          criteriaValue = {
            type: "integer",
            value: valueExtension.valueInteger,
          };
        } else if (valueExtension.valueBoolean !== undefined) {
          criteriaValue = {
            type: "boolean",
            value: valueExtension.valueBoolean,
          };
        } else if (valueExtension.valueDateTime !== undefined) {
          const dateValue = new Date(valueExtension.valueDateTime);
          criteriaValue = {
            type: "datetime",
            value: dateValue,
          };
        } else if (valueExtension.valueCoding !== undefined) {
          criteriaValue = { type: "coding", value: valueExtension.valueCoding };
        }
      }
    }
    // Prepare the data to edit the expression
    const editData = {
      exclude: characteristic.exclude || false,
      expressionId: characteristic.linkId || "",
      expressionName: characteristic.definitionExpression?.name || "",
      expressionDescription: characteristic.description || "",
      selectedLibrary: characteristic.definitionExpression?.reference
        ? { url: characteristic.definitionExpression.reference }
        : undefined,
      selectedExpression: characteristic.definitionExpression?.expression || "",
      selectedParameter: selectedParameter,
      criteriaValue: criteriaValue,
    };
    // Build the path to the characteristic
    const targetPath = [...currentPath, index];
    onAction?.("expression", targetPath, editData);
  };

  /**
   * Handles the editing of a canonical characteristic.
   */
  const handleEditCanonical = async (characteristic: any, index: number) => {
    try {
      // Fetch the referenced EvidenceVariable using the canonical URL
      const canonicalUrl = characteristic.definitionCanonical;
      const canonicalEV =
        await EvidenceVariableService.readEvidenceVariableByUrl(canonicalUrl);
      // Check if an entry was found
      if (!canonicalEV.entry || canonicalEV.entry.length === 0) {
        throw new Error(
          `EvidenceVariable not found at canonical URL: ${canonicalUrl}`
        );
      }
      // TODO : Remplace the ANY with the correct type for referencedEV
      const referencedEV = canonicalEV.entry[0].resource as any;
      const evModel = new EvidenceVariableModel(referencedEV);
      const selectedExpression = evModel.getExpression();
      // Prepare the data to edit the canonical
      const editData = {
        exclude: characteristic.exclude || false,
        evidenceVariable: {
          id: referencedEV.id,
          title: referencedEV.title || "",
          description: referencedEV.description || "",
          identifier: referencedEV.identifier?.[0]?.value || "",
          status: referencedEV.status || "",
          url: referencedEV.url || "",
          selectedLibrary: undefined,
        },
        selectedExpression: selectedExpression,
      };
      // Build the path to the characteristic
      const targetPath = [...currentPath, index];
      onAction?.("editCanonical", targetPath, editData);
    } catch (error) {
      console.error("Error during the canonical edit data:", error);
    }
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <div className="mt-4">
      {characteristics.map((characteristic, index) => (
        <Accordion defaultActiveKey="0" key={index} className="mb-4">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              {/* DefinitionByCombination Header */}
              {characteristic.definitionByCombination && (
                <div className="d-flex align-items-center gap-4">
                  <Title
                    level={3}
                    content={`${i18n.t(
                      "title.combination"
                    )} ${getLogicalOperatorFromCode(
                      characteristic.definitionByCombination.code,
                      characteristic.definitionByCombination.extension
                    )} - ${
                      characteristic.linkId ||
                      characteristic.definitionByCombination.name ||
                      "N/A"
                    }`}
                  />
                  {/* Excluded Badge */}
                  {characteristic.exclude && (
                    <Badge bg="warning">{i18n.t("label.excluded")}</Badge>
                  )}
                  {editMode && (
                    <FontAwesomeIcon
                      className="actionIcon"
                      icon={faPen}
                      size="lg"
                      title={i18n.t("button.editthecharacteristic")}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCombination(characteristic, index);
                      }}
                    />
                  )}
                  {editMode && onAction && (
                    <EvidenceVariableButtons
                      buttonType="characteristic"
                      editMode={editMode}
                      onAction={handleAction(index)}
                      type={type}
                      hasExistingCombination={hasExistingCombination}
                    />
                  )}
                </div>
              )}

              {/* DefinitionCanonical Header */}
              {characteristic.definitionCanonical && (
                <div className="d-flex align-items-center gap-4">
                  <Title
                    level={3}
                    content={`${i18n.t("title.canonical")} - ${
                      characteristic.linkId ||
                      characteristic.definitionCanonical.name ||
                      "N/A"
                    }`}
                  />
                  {/* Excluded Badge - Moved to header */}
                  {characteristic.exclude && (
                    <Badge bg="warning">{i18n.t("label.excluded")}</Badge>
                  )}
                </div>
              )}

              {/* DefinitionExpression Header */}
              {characteristic.definitionExpression && (
                <div className="d-flex align-items-center gap-4">
                  <Title
                    level={3}
                    content={`Expression - ${
                      characteristic.linkId ||
                      characteristic.definitionExpression.name ||
                      "N/A"
                    }`}
                  />
                  {/* Excluded Badge */}
                  {characteristic.exclude && (
                    <Badge bg="warning">{i18n.t("label.excluded")}</Badge>
                  )}
                  {editMode && (
                    <FontAwesomeIcon
                      className="actionIcon"
                      icon={faPen}
                      size="lg"
                      title={i18n.t("button.editthecharacteristic")}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExpression(characteristic, index);
                      }}
                    />
                  )}
                </div>
              )}
            </Accordion.Header>

            <Accordion.Body>
              {/* For DefinitionCanonical - Show the parameterization form */}
              {characteristic.definitionCanonical && canonicalEVData[index] && (
                <ParameterizableEvidenceVariableForm
                  evidenceVariableData={canonicalEVData[index]}
                  selectedExpression={canonicalEVData[index].selectedExpression}
                  selectedParameter={canonicalEVData[index].selectedParameter}
                  criteriaValue={canonicalEVData[index].criteriaValue}
                  onSave={(data) => handleSaveParameterization(index, data)}
                  readonly={!editMode}
                  type={type}
                />
              )}

              {/* For other types - show description as before */}
              {(characteristic.definitionByCombination ||
                characteristic.definitionExpression) && (
                <>
                  <div className="d-flex gap-1">
                    <div className="fw-bold">Description : </div>
                    {characteristic.description || "N/A"}
                  </div>

                  {/* Recursion for combinations */}
                  {characteristic.definitionByCombination?.characteristic
                    ?.length > 0 && (
                    <CharacteristicDisplay
                      characteristics={
                        characteristic.definitionByCombination.characteristic
                      }
                      editMode={editMode}
                      currentPath={[...currentPath, index]}
                      onAction={onAction}
                      type={type}
                      hasExistingCombination={hasExistingCombination}
                    />
                  )}

                  {/* Message if combination is empty */}
                  {characteristic.definitionByCombination &&
                    (!characteristic.definitionByCombination.characteristic ||
                      characteristic.definitionByCombination.characteristic
                        .length === 0) && (
                      <Alert variant="warning" className="mt-3">
                        <FontAwesomeIcon icon={faWarning} className="me-2" />
                        {i18n.t("message.emptycombination")}
                      </Alert>
                    )}
                </>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      ))}
    </div>
  );
};

export default CharacteristicDisplay;
