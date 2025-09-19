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
 * Component for handling integer parameters in inclusion criteria.
 *
 * @param value - The current InclusionCriteriaValue object
 * @param onChange - Callback function to handle changes to the value
 * @param errors - Optional errors object for validation messages
 * @param validateField - Function to validate the updated field
 * @returns JSX.Element representing the integer parameter form
 */
const IntegerParameter: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
  errors?: ValidationErrors;
  validateField: (field: string, value: any, isRequired?: boolean) => void;
}> = ({ value, onChange, errors, validateField }) => {
  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Change handler for the integer value input field
   * @param newValue - The new numeric value (as string) entered by the user
   */
  const handleValueChange = (newValue: string) => {
    const numericValue = newValue ? parseInt(newValue) : undefined;
    onChange({
      ...value,
      value: numericValue,
    });
    validateField("criteriaValue", numericValue, true);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Form.Group className="mb-3">
      <Form.Label>{i18n.t("label.value")}</Form.Label>
      <Form.Control
        type="number"
        placeholder={i18n.t("placeholder.value")}
        value={value?.value?.toString() || ""}
        onChange={(e) => handleValueChange(e.target.value)}
        isInvalid={!!errors?.criteriaValue}
      />
      <Form.Control.Feedback type="invalid">
        {errors?.criteriaValue}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default IntegerParameter;
