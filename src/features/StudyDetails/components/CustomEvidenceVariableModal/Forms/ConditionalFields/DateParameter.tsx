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

/**
 * Component for handling date parameters in inclusion criteria.
 * 
 * @param value - The current InclusionCriteriaValue object
 * @param onChange - Callback function to handle changes to the value
 * @returns JSX.Element representing the date parameter form
 */
const DateParameter: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
  errors?: Record<string, string>;
}> = ({ value, onChange, errors }) => {
  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { comparatorOptions, error } = useComparators("date");

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
    const dateValue = newValue ? new Date(newValue) : undefined;
    onChange({
      ...value,
      [field]: dateValue,
    });
  };

  /**
   * Helper function to format Date to a string suitable for input type="date"
   * Can be MM-DD-YYYY or DD-MM-YYYY depending on the browser locale
   * @param date - The Date object to format
   * @returns The formatted date string or empty string if date is undefined
   */
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date || !(date instanceof Date)) return "";
    return date.toISOString().split("T")[0];
  };

  /**
   * To check if the selected operator is a range operator
   *
   * @param operator is the operator to check
   * @returns True if the operator is a range operator, false otherwise
   */
  const isRangeOperator = (operator: string | undefined): boolean => {
    if (!operator) return false;
    return (
      operator.toLowerCase().includes("inperiod") ||
      operator.toLowerCase().includes("notinperiod")
    );
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
            <Form.Label>{i18n.t("label.startdate")}</Form.Label>
            <Form.Control
              type="date"
              value={formatDateForInput(value?.minValue as Date)}
              onChange={(e) => handleValueChange("minValue", e.target.value)}
              isInvalid={!!errors?.minValue}
            />
            <Form.Control.Feedback type="invalid">
              {errors?.minValue}
            </Form.Control.Feedback>
          </div>
          <div className="flex-fill">
            <Form.Label>{i18n.t("label.enddate")}</Form.Label>
            <Form.Control
              type="date"
              value={formatDateForInput(value?.maxValue as Date)}
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
        <Form.Label>{i18n.t("label.date")}</Form.Label>
        <Form.Control
          type="date"
          placeholder={i18n.t("placeholder.date")}
          value={formatDateForInput(value?.value as Date)}
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
              className="mb-2"
              isInvalid={!!errors?.criteriaOperator}
            >
              <option value="">{i18n.t("placeholder.comparisonoperator")}</option>
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

export default DateParameter;
