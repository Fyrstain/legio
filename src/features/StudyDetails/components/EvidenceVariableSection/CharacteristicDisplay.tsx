// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Accordion, Alert, Badge } from "react-bootstrap";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning, faPen } from "@fortawesome/free-solid-svg-icons";
// Types
import { EvidenceVariableActionType } from "../../types/evidenceVariable.types";
// Components
import EvidenceVariableButtons from "../EvidenceVariableButtons/EvidenceVariableButtons";
// Front Library
import { Title } from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";
// Services
import EvidenceVariableService from "../../services/evidenceVariable.service";

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
}

const CharacteristicDisplay: FunctionComponent<CharacteristicDisplayProps> = ({
  characteristics,
  editMode,
  onAction,
  currentPath = [],
}) => {
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
          "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-Exclusive-OR" &&
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
        return i18n.t("label.and");
      case "any-of":
        if (hasXorExtension(extensions)) {
          return i18n.t("label.xor");
        } else {
          return i18n.t("label.or");
        }
      default:
        return "N/A";
    }
  }

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
              "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-Exclusive-OR" &&
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
        "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-EVParametrisation"
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
                    )} (${getLogicalOperatorFromCode(
                      characteristic.definitionByCombination.code,
                      characteristic.definitionByCombination.extension
                    )}) - ${characteristic.linkId || "N/A"}`}
                  />
                  {editMode && (
                    <FontAwesomeIcon
                      className="actionIcon"
                      icon={faPen}
                      size="xl"
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
                      characteristic.linkId || "N/A"
                    }`}
                  />
                  {editMode && (
                    <FontAwesomeIcon
                      className="actionIcon"
                      icon={faPen}
                      size="xl"
                      title={i18n.t("button.editthecharacteristic")}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCanonical(characteristic, index);
                      }}
                    />
                  )}
                </div>
              )}
              {/* DefinitionExpression Header */}
              {characteristic.definitionExpression && (
                <div className="d-flex align-items-center gap-4">
                  <Title
                    level={3}
                    content={`Expression - ${characteristic.linkId || "N/A"}`}
                  />
                  {editMode && (
                    <FontAwesomeIcon
                      className="actionIcon"
                      icon={faPen}
                      size="xl"
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
              {/* Description */}
              <div className="d-flex gap-1">
                <div className="fw-bold">Description : </div>
                {characteristic.description || "N/A"}
              </div>
              {/* Excluded Badge */}
              {characteristic.exclude && (
                <Badge bg="warning" className="mb-2">
                  {i18n.t("label.excluded")}
                </Badge>
              )}
              {/* Recursion for combinations */}
              {characteristic.definitionByCombination?.characteristic?.length >
                0 && (
                <CharacteristicDisplay
                  characteristics={
                    characteristic.definitionByCombination.characteristic
                  }
                  editMode={editMode}
                  currentPath={[...currentPath, index]}
                  onAction={onAction}
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
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      ))}
    </div>
  );
};

export default CharacteristicDisplay;
