//React
import { FunctionComponent } from "react";
// Components
import { InclusionCriteriaValue } from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Form } from "react-bootstrap";
// Translation
import i18n from "i18next";

/**
 * Component for handling boolean parameters in inclusion criteria.
 *
 * @param value - The current InclusionCriteriaValue object
 * @param onChange - Callback function to handle changes to the value
 * @param errors - Optional errors object for validation messages
 * @returns JSX.Element representing the boolean parameter form
 */
const BooleanParameter: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
}> = ({ value, onChange }) => {
  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Function to handle the toggle switch change
   * @param checked - The new boolean value to set
   */
  const handleToggle = (checked: boolean) => {
    onChange({
      ...value,
      value: checked,
    });
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <>
      {/* Boolean toggle switch */}
      <Form.Group className="mb-3">
        <Form.Check
          type="switch"
          id="boolean-switch"
          label={value?.value ? i18n.t("label.true") : i18n.t("label.false")}
          checked={!!value?.value}
          onChange={(e) => handleToggle(e.target.checked)}
        />
      </Form.Group>
    </>
  );
};

export default BooleanParameter;
