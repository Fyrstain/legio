//React
import { FunctionComponent } from "react";
// Components
import { InclusionCriteriaValue } from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Alert, Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Hook
import { useComparators } from "../../../../hooks/useComparators";
import { ValidationErrors } from "../../../../hooks/useFormValidation";

/**
 * Component for handling integer parameters in inclusion criteria.
 *
 * @param value - The current InclusionCriteriaValue object
 * @param onChange - Callback function to handle changes to the value
 * @param errors - Optional errors object for validation messages
 * @returns JSX.Element representing the integer parameter form
 */
const IntegerParameter: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
  errors?: ValidationErrors;
  validateField: (field: string, value: any, isRequired?: boolean) => void;
}> = ({ value, onChange, errors, validateField }) => {
  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { comparatorOptions, error } = useComparators("integer");

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Function to handle changes in the operator select input
   * @param event - The change event from the select input
   */
  const handleOperatorChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    onChange({
      ...value,
      operator: event.target.value,
      value: undefined,
      minValue: undefined,
      maxValue: undefined,
    });
    validateField("criteriaOperator", event.target.value, false);
  };

  /**
   * Change handler for the value input fields
   * @param field - The field to update (value, minValue, or maxValue)
   * @param newValue is the new value to set for the field
   */
  const handleValueChange = (
    field: "value" | "minValue" | "maxValue",
    newValue: string
  ) => {
    const numericValue = newValue ? parseInt(newValue) : undefined;
    onChange({
      ...value,
      [field]: numericValue,
    });
    let fieldName: string;
    // Assign the correct field name for validation
    switch (field) {
      case "value":
        fieldName = "criteriaValue";
        break;
      case "minValue":
        fieldName = "minValue";
        break;
      case "maxValue":
        fieldName = "maxValue";
        break;
      default:
        fieldName = field;
    }
    validateField(fieldName, numericValue, true);
  };

  /**
   * To check if the selected operator is a range operator
   *
   * @param operator is the operator to check
   * @returns True if the operator is a range operator, false otherwise
   */
  const isRangeOperator = (operator: string | undefined): boolean => {
    if (!operator) return false;
    return operator.toLowerCase().includes("between");
  };

  /**
   * Function to render the value input field based on the selected operator
   * @returns JSX Element for rendering the value input field
   */
  const renderValueInput = (): JSX.Element => {
    if (isRangeOperator(value.operator)) {
      return (
        <div className="d-flex gap-2">
          <div className="flex-fill">
            <Form.Label>Min</Form.Label>
            <Form.Control
              type="number"
              placeholder={i18n.t("placeholder.minvalue")}
              value={value?.minValue?.toString() || ""}
              onChange={(e) => handleValueChange("minValue", e.target.value)}
              isInvalid={!!errors?.minValue}
            />
            <Form.Control.Feedback type="invalid">
              {errors?.minValue}
            </Form.Control.Feedback>
          </div>
          <div className="flex-fill">
            <Form.Label>Max</Form.Label>
            <Form.Control
              type="number"
              placeholder={i18n.t("placeholder.maxvalue")}
              value={value?.maxValue?.toString() || ""}
              onChange={(e) => handleValueChange("maxValue", e.target.value)}
              isInvalid={!!errors?.maxValue}
            />
            <Form.Control.Feedback type="invalid">
              {errors?.maxValue}
            </Form.Control.Feedback>
          </div>
        </div>
      );
    }
    return (
      <>
        <Form.Label>{i18n.t("label.value")}</Form.Label>
        <Form.Control
          type="number"
          placeholder={i18n.t("placeholder.value")}
          value={value?.value?.toString() || ""}
          onChange={(e) => handleValueChange("value", e.target.value)}
          isInvalid={!!errors?.criteriaValue}
        />
        <Form.Control.Feedback type="invalid">
          {errors?.criteriaValue}
        </Form.Control.Feedback>
      </>
    );
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>{i18n.t("label.logicaloperator")}</Form.Label>
        {error ? (
          <Alert variant="warning" className="mb-2">
            {i18n.t("error.loadingcomparators")} {error}
          </Alert>
        ) : (
          <>
            <Form.Select
              value={value.operator || ""}
              onChange={handleOperatorChange}
              className="mb-2"
              isInvalid={!!errors?.criteriaOperator}
            >
              <option value="">{i18n.t("placeholder.logicaloperator")}</option>
              {comparatorOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.display || option.code}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors?.criteriaOperator}
            </Form.Control.Feedback>
          </>
        )}
      </Form.Group>
      {/* Render the value input based on the selected operator */}
      {value.operator && renderValueInput()}
    </>
  );
};

export default IntegerParameter;
