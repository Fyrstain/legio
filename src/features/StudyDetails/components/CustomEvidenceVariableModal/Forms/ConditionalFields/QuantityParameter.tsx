// React
import { FunctionComponent } from "react";
// Components
import { InclusionCriteriaValue } from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Form, Row, Col } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Hook
import { ValidationErrors } from "../../../../hooks/useFormValidation";

/**
 * Component for handling Quantity parameters in inclusion criteria.
 *
 * @param value - The current InclusionCriteriaValue object
 * @param onChange - Callback function to handle changes to the value
 * @param errors - Optional errors object for validation messages
 * @param validateField - Function to validate a specific field
 * @returns JSX.Element representing the quantity parameter form
 */
const QuantityParameter: FunctionComponent<{
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
   * Handle changes to the quantity value
   * @param field - The field being updated (value, unit, system, code)
   * @param newValue - The new value for the field
   */
  const handleFieldChange = (field: string, newValue: any) => {
    const currentQuantity = (value?.value as any) || {};
    
    const updatedQuantity = {
      ...currentQuantity,
      [field]: newValue,
    };

    // Si on change unit, mettre à jour code aussi
    if (field === "unit") {
      updatedQuantity.code = newValue;
    }

    onChange({
      ...value,
      value: updatedQuantity,
    });

    // Validate the numeric value field
    if (field === "value") {
      validateField("criteriaQuantityValue", newValue, true);
    }
  };

  /**
   * Get the current value of a specific field from the Quantity object
   * @param field - The field name
   * @returns The field value or empty string
   */
  const getFieldValue = (field: string): any => {
    if (!value?.value || typeof value.value !== "object") {
      return "";
    }
    return (value.value as any)[field] || "";
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Row className="g-2">
      {/* Numeric Value */}
      <Col md={4}>
        <Form.Control
          type="number"
          step="any"
          value={getFieldValue("value")}
          onChange={(e) => 
            handleFieldChange("value", e.target.value ? parseFloat(e.target.value) : undefined)
          }
          placeholder={i18n.t("placeholder.quantity.value")}
          isInvalid={!readonly && !!errors?.criteriaQuantityValue}
          disabled={readonly}
          size="sm"
        />
        {!readonly && (
          <Form.Control.Feedback type="invalid" className="d-block small">
            {errors?.criteriaQuantityValue}
          </Form.Control.Feedback>
        )}
      </Col>

      {/* Unit */}
      <Col md={4}>
        <Form.Control
          type="text"
          value={getFieldValue("unit")}
          onChange={(e) => handleFieldChange("unit", e.target.value || undefined)}
          placeholder={i18n.t("placeholder.quantity.unit")}
          disabled={readonly}
          size="sm"
        />
      </Col>

      {/* System */}
      <Col md={4}>
        <Form.Control
          type="text"
          value={getFieldValue("system")}
          onChange={(e) => handleFieldChange("system", e.target.value || undefined)}
          placeholder={i18n.t("placeholder.quantity.system")}
          disabled={readonly}
          size="sm"
        />
      </Col>
    </Row>
  );
};

export default QuantityParameter;
