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
import BaseEvidenceVariableForm from "./Forms/BaseEvidenceVariableForm";
// Types
import { FormEvidenceVariableData } from "../../types/evidenceVariable.types";
// Service
import EvidenceVariableService from "../../services/evidenceVariable.service";

////////////////////////////////
//           Props            //
////////////////////////////////

interface ExistingInclusionCriteriaModalProps {
  // To show or hide the modal
  show: boolean;
  // Callback to hide the modal
  onHide: () => void;
  // Callback to save the data
  onSave: (data: ExistingInclusionCriteriaFormData) => void;
  // To indicate if the modal is for a canonical inclusion criteria or a simple inclusion criteria
  isCanonical?: boolean;
  // Modal mode
  mode: "create" | "update";
  // Initial data (for update mode)
  initialData?: ExistingInclusionCriteriaFormData;
}

interface ExistingInclusionCriteriaFormData {
  exclude: boolean;
  selectedEvidenceVariable?: FormEvidenceVariableData;
}

const ExistingCanonicalModal: FunctionComponent<
  ExistingInclusionCriteriaModalProps
> = ({ show, onHide, onSave, mode = "create", initialData, isCanonical }) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [formData, setFormData] = useState<ExistingInclusionCriteriaFormData>({
    exclude: false,
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
          exclude: false,
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
    const loadEvidenceVariables = async () => {
      try {
        const models = await EvidenceVariableService.loadEvidenceVariables(
          "",
          "inclusion"
        );
        const displayObjects = models.map((model) => model.toDisplayObject());
        setEvidenceVariables(displayObjects);
      } catch (error) {
        console.error("Error loading evidence variables:", error);
      }
    };
    loadEvidenceVariables();
  }, []);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate modal title based on mode
   */
  const getModalTitle = (): string => {
    const actionText =
      mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    return `${actionText} ${i18n.t("title.existingcanonicalcriteria")}`;
  };

  /**
   * Handle exclude change from ExcludeCard
   */
  const handleExcludeChange = (exclude: boolean) => {
    setFormData((prev) => ({ ...prev, exclude }));
    setHasChanges(true);
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
      exclude: false,
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
        exclude: false,
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
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Title level={2} content={getModalTitle()} />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* First Card: Exclude settings */}
        {isCanonical && (
            <ExcludeCard
              exclude={formData.exclude}
              onChange={handleExcludeChange}
            />
        )}

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

export default ExistingCanonicalModal;
