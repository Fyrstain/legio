//React
import { FunctionComponent } from "react";
// Components
import { InclusionCriteriaValue } from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Alert, Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Hooks
import { useComparators } from "../../../../hooks/useComparators";
import { ValidationErrors } from "../../../../hooks/useFormValidation";

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
  errors?: ValidationErrors;
  validateField: (field: string, value: any, isRequired?: boolean) => void;
}> = ({ value, onChange, errors, validateField }) => {
  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { comparatorOptions, error } = useComparators("boolean");

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
    });
    validateField("criteriaOperator", event.target.value, true);
  };

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
      {/* Comparator selection */}
      <Form.Group className="mb-3">
        <Form.Label>{i18n.t("label.comparisonoperator")}</Form.Label>
        {error ? (
          <Alert variant="warning" className="mb-2">
            {i18n.t("error.loadingcomparators")} {error}
          </Alert>
        ) : (
          <>
            <Form.Select
              value={value.operator || ""}
              onChange={handleOperatorChange}
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
