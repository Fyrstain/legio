// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Form, Button, Alert } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Components
import ConditionalFieldsContainer from "./ConditionalFieldsContainer";
// Types
import {
  FormEvidenceVariableData,
  InclusionCriteriaValue,
} from "../../../types/evidenceVariable.types";
// Hooks
import { useFormValidation } from "../../../hooks/useFormValidation";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

////////////////////////////////
//           Utils            //
////////////////////////////////

const capitalize = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

////////////////////////////////
//           Props            //
////////////////////////////////

interface ParameterizableEvidenceVariableFormProps {
  // Data of the EvidenceVariable to display (read-only fields)
  evidenceVariableData: FormEvidenceVariableData & {
    availableParameters?: Array<{
      name: string;
      type: string;
      valueSetUrl?: string;
    }>;
  };
  // Expression currently selected (can be empty)
  selectedExpression?: string;
  // All parameter values (map of parameter name to value)
  parameterValues?: { [parameterName: string]: InclusionCriteriaValue };
  // Callback to save changes
  onSave: (data: {
    selectedExpression: string;
    parameterValues: { [parameterName: string]: InclusionCriteriaValue };
  }) => void;
  // Read-only mode (if true, all fields are disabled)
  readonly?: boolean;
  // Type of EV (inclusion or exclusion)
  type?: "inclusion" | "study";
}

const ParameterizableEvidenceVariableForm: FunctionComponent<
  ParameterizableEvidenceVariableFormProps
> = ({
  evidenceVariableData,
  selectedExpression = "",
  parameterValues = {},
  onSave,
  readonly = false,
}) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  // Initial data to reset the form
  const initialData = {
    selectedExpression: selectedExpression,
    parameterValues: parameterValues,
  };

  // States for editable fields
  const [currentExpression, setCurrentExpression] =
    useState(selectedExpression);
  const [currentParameterValues, setCurrentParameterValues] = useState<{
    [parameterName: string]: InclusionCriteriaValue;
  }>(parameterValues);

  const availableParameters = evidenceVariableData.availableParameters || [];

  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { errors, validateField, clearErrors } = useFormValidation();

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Handle criteria value change for a specific parameter
   * @param parameterName Name of the parameter
   * @param value New criteria value
   */
  const handleCriteriaValueChange = (
    parameterName: string,
    value: InclusionCriteriaValue
  ) => {
    setCurrentParameterValues((prev) => ({
      ...prev,
      [parameterName]: value,
    }));
  };

  /**
   * Validate form fields
   * @returns True if the form is valid, false otherwise
   */
  const isFormValid = (): boolean => {
    const expressionError = validateField(
      "selectedExpression",
      currentExpression,
      true
    );
    // Validate all parameter values for both inclusion and study types
    let parameterErrors = false;
    Object.entries(currentParameterValues).forEach(([paramName, cv]) => {
      if (cv) {
        // Different validation based on type
        if (cv.type === "coding") {
          // For coding type, check if code exists within the coding object
          let codeValue = cv.value;
          if (
            typeof cv.value === "object" &&
            cv.value !== null &&
            "code" in cv.value
          ) {
            codeValue = cv.value.code;
          }
          const codeError = validateField(
            `${paramName}_criteriaCode`,
            codeValue,
            true
          );
          if (codeError) parameterErrors = true;
        } else if (
          cv.type === "datetime" ||
          cv.type === "integer" ||
          cv.type === "string"  ||
          cv.type === "quantity"
        ) {
          const valueError = validateField(
            `${paramName}_criteriaValue`,
            cv.value,
            true
          );
          if (valueError) parameterErrors = true;
        }
      }
    });
    return !(expressionError || parameterErrors);
  };

  /**
   * Handle save action - validate and call onSave callback
   * @returns
   */
  const handleSave = () => {
    clearErrors();
    if (!isFormValid()) {
      alert(i18n.t("errormessage.fillrequiredfields"));
      return;
    }
    // Call onSave callback with current data
    onSave({
      selectedExpression: currentExpression,
      parameterValues: currentParameterValues,
    });
  };

  /**
   * Handle reset - clear all editable fields
   */
  const handleReset = () => {
    clearErrors();
    setCurrentExpression(initialData.selectedExpression || "");
    setCurrentParameterValues(initialData.parameterValues || {});
  };

  /**
   * Get parameter-specific errors for a given parameter
   * @param parameterName Name of the parameter
   * @param parameterType Type of the parameter value (coding, integer, datetime, etc.)
   * @returns Object containing the relevant errors for this parameter
   */
  const getParameterErrors = (
    parameterName: string,
    parameterType: string
  ): { [key: string]: string } => {
    const paramErrors: { [key: string]: string } = {};
    if (parameterType === "coding") {
      if (errors?.[`${parameterName}_criteriaCode`]) {
        paramErrors.criteriaCode = errors[`${parameterName}_criteriaCode`];
      }
    } else {
      if (errors?.[`${parameterName}_criteriaValue`]) {
        paramErrors.criteriaValue = errors[`${parameterName}_criteriaValue`];
      }
    }
    return paramErrors;
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Form>
      {/* Section READ-ONLY - Name and Description */}
      <div className="mb-3">
        {/* Name */}
        <div className="row mb-3">
          <Form.Group>
            <Form.Label>{i18n.t("label.name")}</Form.Label>
            <Form.Control
              type="text"
              value={evidenceVariableData.title || "N/A"}
              disabled
              readOnly
            />
          </Form.Group>
        </div>
        {/* Description */}
        <Form.Group>
          <Form.Label>{i18n.t("label.generaldescription")}</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={evidenceVariableData.description || "N/A"}
            disabled
            readOnly
          />
        </Form.Group>
      </div>

      {!currentExpression && (
        <div className="mb-2">
          <Alert variant="warning" className="mb-3">
            <FontAwesomeIcon icon={faWarning} className="me-2" />
            {i18n.t("message.selectexpression")}
          </Alert>
        </div>
      )}

      {/* Expression - Always readonly (expression is defined in the EV and cannot be changed) */}
      <div className="mb-3">
        <Form.Group>
          <Form.Label>Expression</Form.Label>
          <Form.Control
            type="text"
            value={currentExpression || "N/A"}
            disabled
            readOnly
          />
        </Form.Group>
      </div>

      {/* All Parameters - for both inclusion and study types */}
      {availableParameters.length > 0 && (
        <div className="mb-3">
          <div className="row g-3">
            {availableParameters.map((parameter) => {
              // Get or create the value for this parameter
              const paramValue = currentParameterValues[parameter.name] || {
  type: parameter.type.toLowerCase() as any,
  value:
    parameter.type.toLowerCase() === "boolean"
      ? false
      : parameter.type.toLowerCase() === "quantity"
      ? { value: undefined, comparator: undefined, unit: undefined, code: undefined, system: undefined }
      : undefined,
  ...(parameter.valueSetUrl &&
    parameter.type.toLowerCase() === "coding" && {
      valueSetUrl: parameter.valueSetUrl,
    }),
};
              
              return (
                <div key={parameter.name} className="col-12">
                  <Form.Group>
                    <Form.Label className="text-break">
                      {capitalize(parameter.name)}
                    </Form.Label>
                    <ConditionalFieldsContainer
                      value={paramValue}
                      onChange={
                        readonly
                          ? () => {}
                          : (value) =>
                              handleCriteriaValueChange(parameter.name, value)
                      }
                      errors={
                        readonly
                          ? {}
                          : getParameterErrors(parameter.name, paramValue.type)
                      }
                      validateField={(field, value, isRequired) => {
                        // Prefix the field name with parameter name for unique validation
                        validateField(
                          `${parameter.name}_${field}`,
                          value,
                          isRequired
                        );
                      }}
                      readonly={readonly}
                    />
                  </Form.Group>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!readonly && (
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleSave}>
            {i18n.t("button.save")}
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            {i18n.t("button.reset")}
          </Button>
        </div>
      )}
    </Form>
  );
};

export default ParameterizableEvidenceVariableForm;
