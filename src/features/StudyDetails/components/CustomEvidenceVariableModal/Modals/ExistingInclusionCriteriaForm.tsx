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

const ExistingCanonicalForm: FunctionComponent<
  ExistingInclusionCriteriaFormProps
> = ({ show, onHide, onSave, mode = "create", initialData }) => {
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
  //        LifeCycle           //
  ////////////////////////////////

  // Reset state when modal opens/closes
  useEffect(() => {
    if (show) {
      if (mode === "update" && initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          selectedEvidenceVariable: undefined,
        });
      }
      setHasChanges(false);
    }
  }, [show, mode, initialData]);

  /**
   * Load EvidenceVariable data on component mount.
   */
  useEffect(() => {
    if (show) {
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
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    return !!formData.selectedEvidenceVariable;
  };

  /**
   * Handle form submission
   */
  const handleSave = () => {
    if (validateForm()) {
      console.log("Existing Canonical Data to save:", formData);
      onSave(formData);
    } else {
      alert(i18n.t("errormessage.selectevidencevariable"));
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
    setFormData({
      selectedEvidenceVariable: undefined,
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
        selectedEvidenceVariable: undefined,
      });
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
    <BaseModalWrapper
      show={show}
      onHide={onHide}
      onSave={handleSave}
      onReset={handleReset}
      title={getModalTitle()}
      isSaveEnabled={isSaveEnabled()}
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
            >
              <option value="">{i18n.t("placeholder.selectcriteria")}</option>
              {evidenceVariables.map((evidenceVariable) => (
                <option key={evidenceVariable.id} value={evidenceVariable.id}>
                  {evidenceVariable.title} - {evidenceVariable.url}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
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
            />
          )}
        </Card.Body>
      </Card>
    </BaseModalWrapper>
  );
};

export default ExistingCanonicalForm;
