// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Modal, Button, Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front library
import { Title } from "@fyrstain/hl7-front-library";
// Components
import ExcludeCard from "./Forms/ExcludeCard";
import ConditionalFieldsContainer from "./ConditionalFieldsContainer";
// Types
import { LibraryReference, LibraryParameter } from "../../types/library.types";
import { InclusionCriteriaValue } from "../../types/evidenceVariable.types";
// Models
import { LibraryModel } from "../../../../shared/models/Library.model";
// Services
import LibraryService from "../../services/library.service";
// Utils
import { getUITypeFromLibraryParameter } from "../../../../shared/utils/libraryParameterMapping";

////////////////////////////////
//           Props            //
////////////////////////////////

interface ExpressionModalProps {
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

const ExpressionModal: FunctionComponent<ExpressionModalProps> = ({
  show,
  onHide,
  onSave,
  mode = "create",
  initialData,
}) => {
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
  //        LifeCycle           //
  ////////////////////////////////

  // Load libraries when modal opens
  useEffect(() => {
    if (show) {
      loadLibraries();
      if (mode === "update" && initialData) {
        setFormData(initialData);
      } else {
        resetFormData();
      }
      setHasChanges(false);
    }
  }, [show, mode, initialData]);

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
      mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
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
  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.expressionDescription?.trim()) {
      return false;
    }

    if (!formData.selectedLibrary) {
      return false;
    }

    if (!formData.selectedExpression?.trim()) {
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSave = () => {
    if (validateForm()) {
      console.log("Expression Data to save:", formData);
      onSave(formData);
    } else {
      alert(i18n.t("errormessage.fillrequiredfields"));
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(i18n.t("message.unsavedchanges"));
      if (!confirmClose) return;
    }

    resetFormData();
    setHasChanges(false);
    onHide();
  };

  /**
   * Handle reset action
   */
  const handleReset = () => {
    if (mode === "update" && initialData) {
      setFormData(initialData);
    } else {
      resetFormData();
    }
    setHasChanges(false);
  };

  /**
   * Check if save button should be enabled
   */
  const isSaveEnabled = (): boolean => {
    return validateForm() && hasChanges;
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Title level={2} content={getModalTitle()} />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* First Card: Exclude settings */}
        <ExcludeCard
          exclude={formData.exclude}
          onChange={handleExcludeChange}
        />

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
                />
              </Form.Group>

              {/* Library dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>{i18n.t("label.library")} *</Form.Label>
                <Form.Select
                  value={formData.selectedLibrary?.id || ""}
                  onChange={handleLibrarySelectChange}
                  disabled={loadingLibraries}
                >
                  <option value="">{i18n.t("placeholder.library")}</option>
                  {libraries.map((library) => (
                    <option key={library.getId()} value={library.getId()}>
                      {library.getName()} - {library.getUrl()}
                    </option>
                  ))}
                </Form.Select>
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
                    !formData.selectedLibrary ||
                    availableExpressions.length === 0
                  }
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
              </Form.Group>

              {/* Parameter dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>{i18n.t("label.parameter")}</Form.Label>
                <Form.Select
                  value={formData.selectedParameter || ""}
                  onChange={handleParameterSelectChange}
                  disabled={
                    !formData.selectedLibrary ||
                    availableParameters.length === 0
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
                />
              )}
            </Form>
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isSaveEnabled()}
        >
          {i18n.t("button.save")}
        </Button>
        <Button variant="secondary" onClick={handleReset}>
          {i18n.t("button.reset")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExpressionModal;