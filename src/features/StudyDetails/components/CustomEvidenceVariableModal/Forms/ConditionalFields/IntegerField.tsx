//React
import { FunctionComponent } from "react";
// Components
import {
  IntegerOperatorType,
  InclusionCriteriaValue,
} from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Form } from "react-bootstrap";
// Translation
import i18n from "i18next";

const IntegerField: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
}> = ({ value, onChange }) => {
    
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  /**
   * Constant for the operator options for integer criteria
   */
  const integerOperatorOptions = [
    { value: "equals", labelKey: "label.equals" },
    { value: "greaterThan", labelKey: "label.greaterthan" },
    { value: "lessThan", labelKey: "label.lessthan" },
    { value: "greaterThanOrEqual", labelKey: "label.greaterthanorequal" },
    { value: "lessThanOrEqual", labelKey: "label.lessthanorequal" },
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
      operator: event.target.value as IntegerOperatorType,
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
    const numericValue = newValue ? parseInt(newValue) : undefined;
    onChange({
      ...value,
      [field]: numericValue,
    });
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
            <Form.Label>Min</Form.Label>
            <Form.Control
              type="number"
              placeholder={i18n.t("placeholder.minvalue")}
              value={value?.minValue?.toString() || ""}
              onChange={(e) => handleValueChange("minValue", e.target.value)}
            />
          </div>
          <div className="flex-fill">
            <Form.Label>Max</Form.Label>
            <Form.Control
              type="number"
              placeholder={i18n.t("placeholder.maxvalue")}
              value={value?.maxValue?.toString() || ""}
              onChange={(e) => handleValueChange("maxValue", e.target.value)}
            />
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
        <Form.Label>{i18n.t("label.logicaloperator")}</Form.Label>
        <Form.Select
          value={value.operator || ""}
          onChange={handleOperatorChange}
          className="mb-2"
        >
          <option value="">{i18n.t("placeholder.logicaloperator")}</option>
          {integerOperatorOptions.map((option) => (
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

export default IntegerField;
