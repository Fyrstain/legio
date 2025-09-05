//React
import { FunctionComponent } from "react";
// Components
import {
  DateOperatorType,
  InclusionCriteriaValue,
} from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Form } from "react-bootstrap";
// Translation
import i18n from "i18next";

const DateField: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
}> = ({ value, onChange }) => {
    
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  /**
   * To have the translation for the date operator options
   */
  const dateOperatorOptions = [
    { value: "equals", labelKey: "label.equals" },
    { value: "before", labelKey: "label.before" },
    { value: "after", labelKey: "label.after" },
    { value: "between", labelKey: "label.between" },
  ];

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
      operator: event.target.value as DateOperatorType,
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
   * Function to render the value input field based on the selected operator
   * @returns JSX Element for rendering the value input field
   */
  const renderValueInput = (): JSX.Element => {
    if (value.operator === "between") {
      return (
        <div className="d-flex gap-2">
          <div className="flex-fill">
            <Form.Label>{i18n.t("label.startdate")}</Form.Label>
            <Form.Control
              type="date"
              value={formatDateForInput(value?.minValue as Date)}
              onChange={(e) => handleValueChange("minValue", e.target.value)}
            />
          </div>
          <div className="flex-fill">
            <Form.Label>{i18n.t("label.enddate")}</Form.Label>
            <Form.Control
              type="date"
              value={formatDateForInput(value?.maxValue as Date)}
              onChange={(e) => handleValueChange("maxValue", e.target.value)}
            />
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
        />
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
        <Form.Select
          value={value.operator || ""}
          onChange={handleOperatorChange}
          className="mb-2"
        >
          <option value="">{i18n.t("placeholder.comparisonoperator")}</option>
          {dateOperatorOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {i18n.t(option.labelKey)}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      {/* Render the value input based on the selected operator */}
      {value.operator && renderValueInput()}
    </>
  );
};

export default DateField;
