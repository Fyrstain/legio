// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Components
import BaseEvidenceVariableForm from "../Forms/BaseEvidenceVariableForm";
import BaseModalWrapper from "../shared/BaseModalWrapper";
// Types
import { FormEvidenceVariableData } from "../../../types/evidenceVariable.types";
// Service
import EvidenceVariableService from "../../../services/evidenceVariable.service";
// Hooks
import { useFormValidation } from "../../../hooks/useFormValidation";

////////////////////////////////
//           Props            //
////////////////////////////////

interface ExistingInclusionCriteriaFormProps {
  // To show or hide the modal
  show: boolean;
  // Callback to hide the modal
  onHide: () => void;
  // Callback to save the data
  onSave: (data: ExistingInclusionCriteriaFormData) => void;
  // Modal mode
  mode: "create" | "update";
  // Initial data (for update mode)
  initialData?: ExistingInclusionCriteriaFormData;
}

interface ExistingInclusionCriteriaFormData {
  selectedEvidenceVariable?: FormEvidenceVariableData;
}

const ExistingInclusionCriteriaForm: FunctionComponent<
  ExistingInclusionCriteriaFormProps
> = (props: ExistingInclusionCriteriaFormProps) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [formData, setFormData] = useState<ExistingInclusionCriteriaFormData>({
    selectedEvidenceVariable: undefined,
  });

  const [evidenceVariables, setEvidenceVariables] = useState<
    FormEvidenceVariableData[]
  >([]);

  const [hasChanges, setHasChanges] = useState(false);

  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { errors, validateField, clearErrors } = useFormValidation();

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // Reset state when modal opens/closes
  useEffect(() => {
    if (props.show) {
      clearErrors();
      if (props.mode === "update" && props.initialData) {
        setFormData(props.initialData);
      } else {
        setFormData({
          selectedEvidenceVariable: undefined,
        });
      }
      setHasChanges(false);
    }
  }, [props.show, props.mode, props.initialData]);

  /**
   * Load EvidenceVariable data on component mount.
   */
  useEffect(() => {
    if (props.show) {
      const loadEvidenceVariables = async () => {
        try {
          const models =
            await EvidenceVariableService.loadAllEvidenceVariables();
          const displayObjects = models.map((model) => model.toDisplayObject());
          setEvidenceVariables(displayObjects);
        } catch (error) {
          console.error("Error loading evidence variables:", error);
        }
      };
      loadEvidenceVariables();
    }
  }, [props.show]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate modal title based on mode
   */
  const getModalTitle = (): string => {
    const actionText =
      props.mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    return `${actionText} ${i18n.t("title.existingcriteria")}`;
  };

  /**
   * Handle evidence variable selection
   */
  const handleEvidenceVariableSelect = (ev?: FormEvidenceVariableData) => {
    setFormData((prev) => ({ ...prev, selectedEvidenceVariable: ev }));
    setHasChanges(true);
  };

  /**
   * Handle dropdown change
   */
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      handleEvidenceVariableSelect(undefined);
      return;
    }
    const selectedEV = evidenceVariables.find((ev) => ev.id === selectedId);
    handleEvidenceVariableSelect(selectedEV);
    validateField("selectedEvidenceVariable", selectedId, true);
  };

  /**
   * Validate form data
   */
  const isFormValid = (): boolean => {
    const selectEVError = validateField(
      "selectedEvidenceVariable",
      formData.selectedEvidenceVariable?.id,
      true
    );
    return !selectEVError;
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
    console.log("Existing Inclusion Criteria Data to save:", formData);
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
      setFormData({
        selectedEvidenceVariable: undefined,
      });
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
      {/* Second Card: Evidence Variable Selection */}
      <Card>
        <Card.Header>
          <Card.Title>{i18n.t("title.criteria")}</Card.Title>
        </Card.Header>
        <Card.Body>
          {/* EvidenceVariable dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.criteria")} *</Form.Label>
            <Form.Select
              value={formData.selectedEvidenceVariable?.id || ""}
              onChange={handleDropdownChange}
              isInvalid={!!errors.selectedEvidenceVariable}
            >
              <option value="">{i18n.t("placeholder.selectcriteria")}</option>
              {evidenceVariables.map((evidenceVariable) => (
                <option key={evidenceVariable.id} value={evidenceVariable.id}>
                  {evidenceVariable.title} - {evidenceVariable.url}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors?.selectedEvidenceVariable}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Display selected evidence variable details */}
          {formData.selectedEvidenceVariable && (
            <BaseEvidenceVariableForm
              key={formData.selectedEvidenceVariable.id}
              data={formData.selectedEvidenceVariable}
              onChange={() => {}}
              readonly={true}
              type="inclusion"
              libraryDisplayValue={
                formData.selectedEvidenceVariable.libraryUrl || "N/A"
              }
              validateField={validateField}
            />
          )}
        </Card.Body>
      </Card>
    </BaseModalWrapper>
  );
};

export default ExistingInclusionCriteriaForm;
