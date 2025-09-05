//React
import { FunctionComponent } from "react";
// Components
import { InclusionCriteriaValue } from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Form } from "react-bootstrap";
// Translation
import i18n from "i18next";

const BooleanField: FunctionComponent<{
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
    onChange({ type: value.type, value: checked });
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Form.Group className="mb-3">
      <Form.Check
        type="switch"
        id="boolean-switch"
        label={value?.value ? i18n.t("label.true") : i18n.t("label.false")}
        checked={!!value?.value}
        onChange={(e) => handleToggle(e.target.checked)}
      />
    </Form.Group>
  );
};

export default BooleanField;
