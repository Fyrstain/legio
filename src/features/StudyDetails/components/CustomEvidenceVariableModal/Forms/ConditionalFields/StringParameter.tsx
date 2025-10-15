//React
import { FunctionComponent } from "react";
// Components
import { InclusionCriteriaValue } from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Hook
import { ValidationErrors } from "../../../../hooks/useFormValidation";

/**
 * Component for handling string parameters in inclusion criteria.
 *
 * @param value - The current InclusionCriteriaValue object
 * @param onChange - Callback function to handle changes to the value
 * @param errors - Optional errors object for validation messages
 * @param validateField - Function to validate the updated field
 * @returns JSX.Element representing the string parameter form
 */
const StringParameter: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
  errors?: ValidationErrors;
  validateField: (field: string, value: any, isRequired?: boolean) => void;
  readonly?: boolean;
}> = ({ value, onChange, errors, validateField, readonly = false }) => {
  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Change handler for the string value input field
   * @param newValue - The new string value entered by the user
   */
  const handleValueChange = (newValue: string) => {
    onChange({
      ...value,
      value: newValue,
    });
    validateField("criteriaValue", newValue, true);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Form.Group>
      <Form.Control
        type="text"
        placeholder={i18n.t("placeholder.value")}
        value={value?.value?.toString() || ""}
        onChange={(e) => handleValueChange(e.target.value)}
        isInvalid={!!errors?.criteriaValue}
        disabled={readonly}
      />
      <Form.Control.Feedback type="invalid">
        {errors?.criteriaValue}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default StringParameter;
