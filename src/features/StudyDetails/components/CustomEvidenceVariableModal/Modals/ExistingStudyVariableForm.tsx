// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Components
import BaseEvidenceVariableForm from "../Forms/BaseEvidenceVariableForm";
import BaseModalWrapper from "../shared/BaseModalWrapper";
import FieldError from "../shared/FieldError";
// Types
import { FormEvidenceVariableData } from "../../../types/evidenceVariable.types";
// Service
import EvidenceVariableService from "../../../services/evidenceVariable.service";
// Hooks
import { useSimpleValidation } from "../../../hooks/useFormValidation";

////////////////////////////////
//           Props            //
////////////////////////////////

interface ExistingStudyVariableFormProps {
  // To show or hide the modal
  show: boolean;
  // Callback to hide the modal
  onHide: () => void;
  // Callback to save the data
  onSave: (data: ExistingStudyVariableFormData) => void;
  // Modal mode
  mode: "create" | "update";
  // Initial data (for update mode)
  initialData?: ExistingStudyVariableFormData;
}

interface ExistingStudyVariableFormData {
  selectedStudyVariable?: FormEvidenceVariableData;
}

const ExistingStudyVariableForm: FunctionComponent<
  ExistingStudyVariableFormProps
> = ({ show, onHide, onSave, mode = "create", initialData }) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [formData, setFormData] = useState<ExistingStudyVariableFormData>({
    selectedStudyVariable: undefined,
  });

  const [studyVariables, setStudyVariables] = useState<
    FormEvidenceVariableData[]
  >([]);

  const [hasChanges, setHasChanges] = useState(false);

  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { errors, validateField, clearErrors } = useSimpleValidation();

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // Reset state when modal opens/closes
  useEffect(() => {
    if (show) {
      if (mode === "update" && initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          selectedStudyVariable: undefined,
        });
      }
      setHasChanges(false);
    }
  }, [show, mode, initialData]);

  /**
   * Load StudyVariable data on component mount.
   */
  useEffect(() => {
    if (show) {
      const loadStudyVariables = async () => {
        try {
          const models =
            await EvidenceVariableService.loadAllEvidenceVariables();
          const displayObjects = models.map((model) => model.toDisplayObject());
          setStudyVariables(displayObjects);
        } catch (error) {
          console.error("Error loading study variables:", error);
        }
      };
      loadStudyVariables();
    }
  }, [show]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate modal title based on mode
   */
  const getModalTitle = (): string => {
    const actionText =
      mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    return `${actionText} ${i18n.t("title.existingstudyvariable")}`;
  };

  /**
   * Handle study variable selection
   */
  const handleStudyVariableSelect = (sv?: FormEvidenceVariableData) => {
    setFormData((prev) => ({ ...prev, selectedStudyVariable: sv }));
    setHasChanges(true);
  };

  /**
   * Handle dropdown change
   */
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      handleStudyVariableSelect(undefined);
      return;
    }
    const selectedSV = studyVariables.find((sv) => sv.id === selectedId);
    handleStudyVariableSelect(selectedSV);
  };

  /**
   * Validate form data
   */
  const isFormValid = (): boolean => {
    const selectSVError = validateField(
      "selectedStudyVariable",
      formData.selectedStudyVariable?.id,
      true
    );
    return !selectSVError;
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
    console.log("Existing Study Variable Data to save:", formData);
    onSave(formData);
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(i18n.t("message.unsavedchanges"));
      if (!confirmClose) return;
    }
    setFormData({
      selectedStudyVariable: undefined,
    });
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
      setFormData({
        selectedStudyVariable: undefined,
      });
    }
    setHasChanges(false);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <BaseModalWrapper
      show={show}
      onHide={onHide}
      onSave={handleSave}
      onReset={handleReset}
      title={getModalTitle()}
      onClose={handleClose}
    >
      {/* Study Variable Selection Card */}
      <Card>
        <Card.Header>
          <Card.Title>{i18n.t("title.studyvariable")}</Card.Title>
        </Card.Header>
        <Card.Body>
          {/* StudyVariable dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.studyvariable")} *</Form.Label>
            <Form.Select
              value={formData.selectedStudyVariable?.id || ""}
              onChange={handleDropdownChange}
              isInvalid={!!errors.selectedStudyVariable}
            >
              <option value="">
                {i18n.t("placeholder.selectstudyvariable")}
              </option>
              {studyVariables.map((studyVariable) => (
                <option key={studyVariable.id} value={studyVariable.id}>
                  {studyVariable.title} - {studyVariable.url}
                </option>
              ))}
            </Form.Select>
            <FieldError error={errors.selectedStudyVariable} />
          </Form.Group>

          {/* Display selected study variable details */}
          {formData.selectedStudyVariable && (
            <BaseEvidenceVariableForm
              key={formData.selectedStudyVariable.id}
              data={formData.selectedStudyVariable}
              onChange={() => {}}
              readonly={true}
              type="study"
              libraryDisplayValue={
                formData.selectedStudyVariable.libraryUrl || "N/A"
              }
            />
          )}
        </Card.Body>
      </Card>
    </BaseModalWrapper>
  );
};

export default ExistingStudyVariableForm;
