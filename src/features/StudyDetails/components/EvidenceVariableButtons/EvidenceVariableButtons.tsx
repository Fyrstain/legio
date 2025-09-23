// React
import { FunctionComponent, useState } from "react";
// React Bootstrap
import { Dropdown, Button } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Types
import {
  EvidenceVariableButtonsProps,
  EvidenceVariableActionType,
} from "../../types/evidenceVariable.types";
// Styles
import styles from "./EvidenceVariableButtons.css";

const EvidenceVariableButtons: FunctionComponent<
  EvidenceVariableButtonsProps
> = ({ buttonType, editMode, onAction, disabled = false, type, hasExistingCombination }) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [showDropdown, setShowDropdown] = useState(false);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Get button text based on type
   */
  const getButtonText = (): string => {
    switch (buttonType) {
      case "criteria":
        return i18n.t("button.addcriteria");
      case "studyVariable":
        return i18n.t("button.addstudyvariable");
      case "characteristic":
        return i18n.t("button.addcharacteristic");
      default:
        return "Add";
    }
  };

  /**
   * Get dropdown options based on button type
   */
  const getDropdownOptions = (): Array<{
    key: EvidenceVariableActionType;
    label: string;
  }> => {
    switch (buttonType) {
      // Options for Inclusion Criteria (To create or to link an existing one)
      case "criteria":
        return [
          { key: "new" as const, label: i18n.t("option.addnewcriteria") },
          {
            key: "existing" as const,
            label: i18n.t("option.addexistingcriteria"),
          },
        ];
      // Options for Study Variable (To create or to link an existing one)
      case "studyVariable":
        return [
          { key: "new" as const, label: i18n.t("option.addnewstudyvariable") },
          {
            key: "existing" as const,
            label: i18n.t("option.addexistingstudyvariable"),
          },
        ];
      // Options for Characteristic (To create new canonical, link existing canonical, create expression or combination)
      case "characteristic":
        const options: Array<{
          key: EvidenceVariableActionType;
          label: string;
        }> = [
          {
            key: "newCanonical" as const,
            label: i18n.t("option.addnewcanonicalreference"),
          },
          {
            key: "existingCanonical" as const,
            label: i18n.t("option.addexistingcanonicalreference"),
          },
        ];
        // Add expression only for inclusion criteria
        if (type === "inclusion") {
          options.push({
            key: "expression" as const,
            label: i18n.t("option.addexpression"),
          });
        }
        // Add combination for inclusion criteria or study variables if no existing combination is present
        if (
          type === "inclusion" ||
          (type === "study" && !hasExistingCombination)
        ) {
          options.push({
            key: "combination" as const,
            label: i18n.t("option.addcombination"),
          });
        }
        return options;
      // Default to empty array if no type matches
      default:
        return [];
    }
  };

  /**
   * Handle option selection
   */
  const handleOptionSelect = (actionType: EvidenceVariableActionType) => {
    setShowDropdown(false);
    onAction(actionType);
  };

  // Don't render if not in edit mode
  if (!editMode) {
    return null;
  }

  return (
    <div className={`d-flex gap-2`} onClick={(e) => e.stopPropagation()}>
      {/* Add Dropdown Button */}
      <Dropdown show={showDropdown} onToggle={setShowDropdown}>
        <Dropdown.Toggle
          id="dropdown-buttons"
          as={Button}
          variant="secondary"
          disabled={disabled}
          className={styles["dropdown-toggle"]}
        >
          {getButtonText()}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {getDropdownOptions().map((option) => (
            <Dropdown.Item
              key={option.key}
              onClick={() => handleOptionSelect(option.key)}
            >
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default EvidenceVariableButtons;
