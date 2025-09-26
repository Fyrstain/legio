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
import { LibraryParameter } from "../../../types/library.types";
// Models
import { LibraryModel } from "../../../../../shared/models/Library.model";
// Services
import LibraryService from "../../../services/library.service";
// Hooks
import { useFormValidation } from "../../../hooks/useFormValidation";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

////////////////////////////////
//           Props            //
////////////////////////////////

interface ParameterizableEvidenceVariableFormProps {
  // Data of the EvidenceVariable to display (read-only fields)
  evidenceVariableData: FormEvidenceVariableData;
  // Expression currently selected (can be empty)
  selectedExpression?: string;
  // Parameter currently selected
  selectedParameter?: string;
  // Current parameter value
  criteriaValue?: InclusionCriteriaValue;
  // Callback to save changes
  onSave: (data: {
    selectedExpression: string;
    selectedParameter: string;
    criteriaValue: InclusionCriteriaValue | undefined;
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
  selectedParameter = "",
  criteriaValue,
  onSave,
  readonly = false,
  type = "inclusion",
}) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  // Initial data to reset the form
  const initialData = {
    selectedExpression: selectedExpression,
    selectedParameter: selectedParameter,
    criteriaValue: criteriaValue,
  };

  // States for editable fields
  const [currentExpression, setCurrentExpression] =
    useState(selectedExpression);
  const [currentParameter, setCurrentParameter] = useState(selectedParameter);
  const [currentCriteriaValue, setCurrentCriteriaValue] = useState<
    InclusionCriteriaValue | undefined
  >(criteriaValue);

  // Library related state
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryModel | null>(
    null
  );
  const [availableExpressions, setAvailableExpressions] = useState<
    LibraryParameter[]
  >([]);
  const [availableParameters, setAvailableParameters] = useState<
    LibraryParameter[]
  >([]);

  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { errors, validateField, clearErrors } = useFormValidation();

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // Load library information when component mounts
  useEffect(() => {
    const loadLibraryInfo = async () => {
      if (evidenceVariableData.libraryUrl) {
        try {
          const libraries = await LibraryService.loadLibraries();
          const library = libraries.find(
            (lib) => lib.getUrl() === evidenceVariableData.libraryUrl
          );
          if (library) {
            setSelectedLibrary(library);
            // Set available expressions and parameters based on type of EV (inclusion = "out" and type boolean, study = "in" and any type)
            if (type === "inclusion") {
              setAvailableExpressions(library.getBooleanExpressions());
            } else {
              setAvailableExpressions(library.getExpressions());
            }
            setAvailableParameters(library.getInputParameters());
          }
        } catch (error) {
          console.error("Error loading library info:", error);
        }
      }
    };
    loadLibraryInfo();
  }, [evidenceVariableData.libraryUrl]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Handle expression selection change
   * @param e Event
   */
  const handleExpressionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const expressionName = e.target.value;
    setCurrentExpression(expressionName);
    validateField("selectedExpression", expressionName, true);
  };

  /**
   * Handle parameter selection change
   * @param e Event
   */
  const handleParameterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parameterName = e.target.value;
    setCurrentParameter(parameterName);
    validateField("selectedParameter", parameterName);
    if (parameterName && selectedLibrary) {
      const parameter = availableParameters.find(
        (p) => p.name === parameterName
      );
      if (parameter) {
        const fhirType = parameter.type.toLowerCase();
        const newCriteriaValue: InclusionCriteriaValue = {
          type: fhirType as any,
          value: fhirType === "boolean" ? false : undefined,
        };
        setCurrentCriteriaValue(newCriteriaValue);
      }
    } else {
      setCurrentCriteriaValue(undefined);
    }
  };

  /**
   * Handle criteria value change
   * @param value New criteria value
   */
  const handleCriteriaValueChange = (value: InclusionCriteriaValue) => {
    setCurrentCriteriaValue(value);
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
    // Validate parameter-related fields if a parameter is selected
    let parameterErrors = false;
    if (currentParameter && currentCriteriaValue) {
      const cv = currentCriteriaValue;
      // Different validation based on type
      if (cv.type === "coding") {
        const valueSetError = validateField(
          "criteriaValueSet",
          cv.valueSetUrl,
          true
        );
        const codeError = validateField("criteriaCode", cv.value, true);
        parameterErrors = !!(valueSetError || codeError);
      } else if (cv.type === "datetime" || cv.type === "integer") {
        const valueError = validateField("criteriaValue", cv.value, true);
        parameterErrors = !!valueError;
      }
    }
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
      selectedParameter: currentParameter,
      criteriaValue: currentCriteriaValue,
    });
  };

  /**
   * Handle reset - clear all editable fields
   */
  const handleReset = () => {
    clearErrors();
    setCurrentExpression(initialData.selectedExpression || "");
    setCurrentParameter(initialData.selectedParameter || "");
    setCurrentCriteriaValue(initialData.criteriaValue || undefined);
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

      {/* EDITABLE section - Parameterization */}
      {/* Expression */}
      <div className="row mb-3">
        <div className="col-md-6">
          <Form.Group>
            <Form.Label>Expression {!readonly && "*"}</Form.Label>
            <Form.Select
              value={currentExpression}
              onChange={handleExpressionChange}
              disabled={
                readonly ||
                !selectedLibrary ||
                availableExpressions.length === 0
              }
              isInvalid={!readonly && !!errors.selectedExpression}
            >
              <option value="">{i18n.t("placeholder.expression")}</option>
              {availableExpressions.map((expression) => (
                <option key={expression.name} value={expression.name}>
                  {expression.name}
                  {expression.documentation && ` - ${expression.documentation}`}
                </option>
              ))}
            </Form.Select>
            {!readonly && (
              <Form.Control.Feedback type="invalid">
                {errors?.selectedExpression}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
        {/* Parameter (only for inclusion type) */}
        {type === "inclusion" && (!readonly || currentParameter) && (
          <div className="col-md-6">
            <Form.Group>
              <Form.Label>{i18n.t("label.parameter")}</Form.Label>
              <Form.Select
                value={currentParameter}
                onChange={handleParameterChange}
                disabled={
                  readonly ||
                  !selectedLibrary ||
                  availableParameters.length === 0
                }
                isInvalid={!readonly && !!errors.selectedParameter}
              >
                <option value="">{i18n.t("placeholder.parameter")}</option>
                {availableParameters.map((parameter) => (
                  <option
                    key={parameter.name}
                    value={parameter.name}
                    title={parameter.documentation}
                  >
                    {parameter.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors?.selectedParameter}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        )}
      </div>

      {/* Conditional Fields */}
      {type === "inclusion" && currentParameter && currentCriteriaValue && (
        <ConditionalFieldsContainer
          value={currentCriteriaValue}
          onChange={readonly ? () => {} : handleCriteriaValueChange}
          errors={readonly ? {} : errors}
          validateField={validateField}
          readonly={readonly}
        />
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
