// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Accordion, Alert, Badge } from "react-bootstrap";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
// Types
import { EvidenceVariableActionType } from "../../types/evidenceVariable.types";
// Components
import EvidenceVariableButtons from "../EvidenceVariableButtons/EvidenceVariableButtons";
// Front Library
import { Title } from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";

/////////////////////////////////
//          Interface        ////
/////////////////////////////////
interface CharacteristicDisplayProps {
  // Array of characteristics to display
  characteristics: any[];
  // Boolean indicating if the component is in edit mode
  editMode: boolean;
  // Optional action handler for evidence variable actions
  onAction?: (actionType: EvidenceVariableActionType, path?: number[]) => void;
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

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <div className="mt-4">
      {characteristics.map((char, index) => (
        <Accordion key={index} className="mb-4">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              {/* DefinitionByCombination Header */}
              {char.definitionByCombination && (
                <div className="d-flex align-items-center">
                  <Title
                    level={3}
                    content={`${i18n.t(
                      "title.combination"
                    )} (${getLogicalOperatorFromCode(
                      char.definitionByCombination.code,
                      char.definitionByCombination.extension
                    )}) - ${char.linkId || "N/A"}`}
                  />
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
              {char.definitionCanonical && (
                <div>
                  <Title
                    level={3}
                    content={`${i18n.t("title.canonical")} - ${
                      char.linkId || "N/A"
                    }`}
                  />
                </div>
              )}
              {/* DefinitionExpression Header */}
              {char.definitionExpression && (
                <div>
                  <Title
                    level={3}
                    content={`Expression - ${char.linkId || "N/A"}`}
                  />
                </div>
              )}
            </Accordion.Header>

            <Accordion.Body>
              {/* Description */}
              <div className="d-flex gap-1">
                <div className="fw-bold">Description : </div>
                {char.description || "N/A"}
              </div>
              {/* Excluded Badge */}
              {char.exclude && (
                <Badge bg="warning" className="mb-2">
                  {i18n.t("label.excluded")}
                </Badge>
              )}
              {/* Recursion for combinations */}
              {char.definitionByCombination?.characteristic?.length > 0 && (
                <CharacteristicDisplay
                  characteristics={char.definitionByCombination.characteristic}
                  editMode={editMode}
                  currentPath={[...currentPath, index]}
                  onAction={onAction}
                />
              )}
              {/* Message if combination is empty */}
              {char.definitionByCombination &&
                (!char.definitionByCombination.characteristic ||
                  char.definitionByCombination.characteristic.length === 0) && (
                  <Alert variant="warning" className="mt-3">
                    <FontAwesomeIcon icon={faWarning} className="me-2" />
                    {i18n.t("message.addcharacteristictocombination")}
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
