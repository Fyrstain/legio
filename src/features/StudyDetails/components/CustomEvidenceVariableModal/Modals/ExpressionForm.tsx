// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Components
import ExcludeCard from "../shared/ExcludeCard";
import ConditionalFieldsContainer from "../Forms/ConditionalFieldsContainer";
import BaseModalWrapper from "../shared/BaseModalWrapper";
// Types
import {
  LibraryReference,
  LibraryParameter,
} from "../../../types/library.types";
import { InclusionCriteriaValue } from "../../../types/evidenceVariable.types";
// Models
import { LibraryModel } from "../../../../../shared/models/Library.model";
// Services
import LibraryService from "../../../services/library.service";
// Utils
import { getUITypeFromLibraryParameter } from "../../../../../shared/utils/libraryParameterMapping";
// Hooks
import { useSimpleValidation } from "../../../hooks/useFormValidation";

////////////////////////////////
//           Props            //
////////////////////////////////

interface ExpressionFormProps {
  // To show or hide the modal
  show: boolean;
  // Callback to close the modal
  onHide: () => void;
  // Callback to save the data
  onSave: (data: ExpressionFormData) => void;
  // Modal mode
  mode: "create" | "update";
  // Initial data (for update mode)
  initialData?: ExpressionFormData;
}

interface ExpressionFormData {
  exclude: boolean;
  expressionId: string;
  expressionName: string;
  expressionDescription: string;
  selectedLibrary?: LibraryReference;
  selectedExpression: string;
  selectedParameter: string;
  criteriaValue?: InclusionCriteriaValue;
}

const ExpressionForm: FunctionComponent<ExpressionFormProps> = (
  props: ExpressionFormProps
) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [formData, setFormData] = useState<ExpressionFormData>({
    exclude: false,
    expressionId: "",
    expressionName: "",
    expressionDescription: "",
    selectedLibrary: undefined,
    selectedExpression: "",
    selectedParameter: "",
    criteriaValue: undefined,
  });

  const [libraries, setLibraries] = useState<LibraryModel[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryModel | null>(
    null
  );
  const [availableExpressions, setAvailableExpressions] = useState<
    LibraryParameter[]
  >([]);
  const [availableParameters, setAvailableParameters] = useState<
    LibraryParameter[]
  >([]);
  const [loadingLibraries, setLoadingLibraries] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);

  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { errors, validateField, clearErrors } = useSimpleValidation();

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // Load libraries when modal opens
  useEffect(() => {
    if (props.show) {
      clearErrors();
      loadLibraries();
      if (props.mode === "update" && props.initialData) {
        setFormData(props.initialData);
      } else {
        resetFormData();
      }
      setHasChanges(false);
    }
  }, [props.show, props.mode, props.initialData]);

  // Update expressions and parameters when library changes
  useEffect(() => {
    if (selectedLibrary) {
      setAvailableExpressions(selectedLibrary.getExpressions());
      setAvailableParameters(selectedLibrary.getInputParameters());
    } else {
      setAvailableExpressions([]);
      setAvailableParameters([]);
    }
  }, [selectedLibrary]);

  // Update selected library when formData.selectedLibrary changes
  useEffect(() => {
    if (formData.selectedLibrary && libraries.length > 0) {
      const library = libraries.find(
        (lib) => lib.getId() === formData.selectedLibrary?.id
      );
      setSelectedLibrary(library || null);
    } else {
      setSelectedLibrary(null);
    }
  }, [formData.selectedLibrary, libraries]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Reset form data to initial state
   */
  const resetFormData = () => {
    setFormData({
      exclude: false,
      expressionId: "",
      expressionName: "",
      expressionDescription: "",
      selectedLibrary: undefined,
      selectedExpression: "",
      selectedParameter: "",
      criteriaValue: undefined,
    });
  };

  /**
   * Load available libraries
   */
  const loadLibraries = async () => {
    setLoadingLibraries(true);
    try {
      const librariesData = await LibraryService.loadLibraries();
      setLibraries(librariesData);
    } catch (error) {
      console.error("Error loading libraries:", error);
    } finally {
      setLoadingLibraries(false);
    }
  };

  /**
   * Generate modal title based on mode
   */
  const getModalTitle = (): string => {
    const actionText =
      props.mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    return `${actionText} ${i18n.t("title.anexpression")}`;
  };

  /**
   * Handle field changes
   */
  const handleFieldChange = (field: keyof ExpressionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    // Reset dependent fields when library changes
    if (field === "selectedLibrary") {
      setFormData((prev) => ({
        ...prev,
        selectedExpression: "",
        selectedParameter: "",
        criteriaValue: undefined,
      }));
    }
    // Reset parameter-dependent fields when expression changes
    if (field === "selectedExpression") {
      setFormData((prev) => ({
        ...prev,
        selectedParameter: "",
        criteriaValue: undefined,
      }));
    }
  };

  /**
   * Handle exclude change from ExcludeCard
   */
  const handleExcludeChange = (exclude: boolean) => {
    handleFieldChange("exclude", exclude);
  };

  /**
   * Handle library selection change
   */
  const handleLibrarySelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const libraryId = e.target.value;
    if (!libraryId) {
      handleFieldChange("selectedLibrary", undefined);
      return;
    }

    const library = libraries.find((lib) => lib.getId() === libraryId);
    if (library) {
      const libraryReference: LibraryReference =
        library.toDisplayLibraryReference();
      handleFieldChange("selectedLibrary", libraryReference);
    }
  };

  /**
   * Handle parameter selection change
   */
  const handleParameterSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const parameterName = e.target.value;
    handleFieldChange("selectedParameter", parameterName);

    if (parameterName && selectedLibrary) {
      const parameter = availableParameters.find(
        (p) => p.name === parameterName
      );
      if (parameter) {
        const uiType = getUITypeFromLibraryParameter(parameter.type);
        handleFieldChange("criteriaValue", {
          type: uiType,
          value: undefined,
        });
      }
    }
  };

  /**
   * Handle criteria value change from ConditionalFieldsContainer
   */
  const handleCriteriaValueChange = (value: InclusionCriteriaValue) => {
    handleFieldChange("criteriaValue", value);
  };

  /**
   * Validate form data
   */
  const isFormValid = (): boolean => {
    const descError = validateField(
      "expressionDescription",
      formData.expressionDescription,
      true
    );
    const libError = validateField(
      "selectedLibrary",
      formData.selectedLibrary?.id,
      true
    );
    const exprError = validateField(
      "selectedExpression",
      formData.selectedExpression,
      true
    );
    // Validation for the conditionals fields
    let parameterErrors = false;
    if (formData.selectedParameter && formData.criteriaValue) {
      const cv = formData.criteriaValue;
      const operatorError = validateField(
        "criteriaOperator",
        cv.operator,
        true
      );
      // Code type requires valueSet and code
      if (cv.type === "code") {
        const valueSetError = validateField(
          "criteriaValueSet",
          cv.valueSetUrl,
          true
        );
        const codeError = validateField("criteriaCode", cv.value, true);
        parameterErrors = !!(operatorError || valueSetError || codeError);
      }
      // Boolean type requires operator
      if (cv.type === "boolean") {
        const operatorError = validateField(
          "criteriaOperator",
          cv.operator,
          true
        );
        parameterErrors = !!operatorError;
      }
      // Date type requires operator and value(s)
      if (cv.type === "date") {
        const operatorError = validateField(
          "criteriaOperator",
          cv.operator,
          true
        );
        if (
          cv.operator?.toLowerCase().includes("inperiod") ||
          cv.operator?.toLowerCase().includes("notinperiod")
        ) {
          const minError = validateField("minValue", cv.minValue, true);
          const maxError = validateField("maxValue", cv.maxValue, true);
          parameterErrors = !!(operatorError || minError || maxError);
        } else {
          const dateError = validateField("criteriaValue", cv.value, true);
          parameterErrors = !!(operatorError || dateError);
        }
      }
      // Integer type requires operator and value(s)
      if (cv.type === "integer") {
        const operatorError = validateField(
          "criteriaOperator",
          cv.operator,
          true
        );
        if (cv.operator?.toLowerCase().includes("between")) {
          const minError = validateField("minValue", cv.minValue, true);
          const maxError = validateField("maxValue", cv.maxValue, true);
          parameterErrors = !!(operatorError || minError || maxError);
        } else {
          const intError = validateField("integerValue", cv.value, true);
          parameterErrors = !!(operatorError || intError);
        }
      }
    }
    return !(descError || libError || exprError || parameterErrors);
  };

  /**
   * Handle form submission
   */
  const handleSave = () => {
    clearErrors();
    if (!isFormValid()) {
      alert(i18n.t("errormessage.fillrequiredfields"));
      return;
    }
    console.log("Expression Data to save:", formData);
    props.onSave(formData);
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(i18n.t("message.unsavedchanges"));
      if (!confirmClose) return;
    }
    handleReset();
    props.onHide();
  };

  /**
   * Handle reset action
   */
  const handleReset = () => {
    clearErrors();
    if (props.mode === "update" && props.initialData) {
      setFormData(props.initialData);
    } else {
      resetFormData();
    }
    setHasChanges(false);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <BaseModalWrapper
      show={props.show}
      onHide={props.onHide}
      onSave={handleSave}
      onReset={handleReset}
      title={getModalTitle()}
      onClose={handleClose}
    >
      {/* First Card: Exclude settings */}
      <ExcludeCard exclude={formData.exclude} onChange={handleExcludeChange} />

      {/* Second Card: Expression definition */}
      <Card>
        <Card.Header>
          <Card.Title>{i18n.t("title.expressiondefinition")}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* ID field */}
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control
                type="text"
                placeholder={i18n.t("placeholder.id")}
                value={formData.expressionId}
                onChange={(e) =>
                  handleFieldChange("expressionId", e.target.value)
                }
              />
            </Form.Group>

            {/* Name field */}
            <Form.Group className="mb-3">
              <Form.Label>{i18n.t("label.name")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={i18n.t("placeholder.name")}
                value={formData.expressionName}
                onChange={(e) =>
                  handleFieldChange("expressionName", e.target.value)
                }
              />
            </Form.Group>

            {/* Description field */}
            <Form.Group className="mb-3">
              <Form.Label>{i18n.t("label.generaldescription")} *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={i18n.t("placeholder.description")}
                value={formData.expressionDescription}
                onChange={(e) =>
                  handleFieldChange("expressionDescription", e.target.value)
                }
                isInvalid={!!errors.expressionDescription}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.expressionDescription}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Library dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>{i18n.t("label.library")} *</Form.Label>
              <Form.Select
                value={formData.selectedLibrary?.id || ""}
                onChange={handleLibrarySelectChange}
                disabled={loadingLibraries}
                isInvalid={!!errors.selectedLibrary}
              >
                <option value="">{i18n.t("placeholder.library")}</option>
                {libraries.map((library) => (
                  <option key={library.getId()} value={library.getId()}>
                    {library.getName()} - {library.getUrl()}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors?.selectedLibrary}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Expression dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>Expression *</Form.Label>
              <Form.Select
                value={formData.selectedExpression || ""}
                onChange={(e) =>
                  handleFieldChange("selectedExpression", e.target.value)
                }
                disabled={
                  !formData.selectedLibrary || availableExpressions.length === 0
                }
                isInvalid={!!errors.selectedExpression}
              >
                <option value="">{i18n.t("placeholder.expression")}</option>
                {availableExpressions.map((expression) => (
                  <option key={expression.name} value={expression.name}>
                    {expression.name}
                    {expression.documentation &&
                      ` - ${expression.documentation}`}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors?.selectedExpression}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Parameter dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>{i18n.t("label.parameter")}</Form.Label>
              <Form.Select
                value={formData.selectedParameter || ""}
                onChange={handleParameterSelectChange}
                disabled={
                  !formData.selectedLibrary || availableParameters.length === 0
                }
              >
                <option value="">{i18n.t("placeholder.parameter")}</option>
                {availableParameters.map((parameter) => (
                  <option
                    key={parameter.name}
                    value={parameter.name}
                    title={parameter.documentation}
                  >
                    {parameter.name} ({parameter.type})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Conditional Fields for parameter configuration */}
            {formData.selectedParameter && formData.criteriaValue && (
              <ConditionalFieldsContainer
                value={formData.criteriaValue}
                onChange={handleCriteriaValueChange}
                errors={errors}
              />
            )}
          </Form>
        </Card.Body>
      </Card>
    </BaseModalWrapper>
  );
};

export default ExpressionForm;
