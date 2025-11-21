// React
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
 * Component for handling date parameters in inclusion criteria.
 *
 * @param value - The current InclusionCriteriaValue object
 * @param onChange - Callback function to handle changes to the value
 * @param errors - Optional errors object for validation messages
 * @param validateField - Function to validate a specific field
 * @returns JSX.Element representing the date parameter form
 */
const DateTimeParameter: FunctionComponent<{
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
   * Handle changes to the date-time input
   * @param newValue - The new date-time value as a string from the input
   */
  const handleValueChange = (newValue: string) => {
    const dateValue = newValue ? new Date(newValue) : undefined;
    onChange({
      ...value,
      value: dateValue,
    });
    validateField("criteriaValue", dateValue, true);
  };

  /**
   * To format a Date object to a string suitable for the datetime-local input
   * @param value - The value to format
   * @returns A string formatted for the datetime-local input
   */
  const formatDateTimeForInput = (val: unknown) => {
    // If the value is undefined or null, return an empty string
    let dateObj: Date;
    // Convert the input to a Date object
    if (typeof val === "string") {
      dateObj = new Date(val);
    } else if (val instanceof Date) {
      dateObj = val;
    } else {
      return "";
    }
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    // Adjust for timezone offset to get local time in ISO format
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString();
    return localISOTime.slice(0, 16);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Form.Group>
      <Form.Control
        type="datetime-local"
        placeholder={i18n.t("placeholder.date")}
        value={formatDateTimeForInput(value?.value)}
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

export default DateTimeParameter;
