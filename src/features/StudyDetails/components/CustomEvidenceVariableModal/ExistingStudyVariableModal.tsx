// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Modal, Button, Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front library
import { Title } from "@fyrstain/hl7-front-library";
// Components
import BaseEvidenceVariableForm from "./Forms/BaseEvidenceVariableForm";
// Types
import { FormEvidenceVariableData } from "../../types/evidenceVariable.types";
// Service
import EvidenceVariableService from "../../services/evidenceVariable.service";

////////////////////////////////
//           Props            //
////////////////////////////////

interface ExistingStudyVariableModalProps {
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

const ExistingStudyVariableModal: FunctionComponent<
  ExistingStudyVariableModalProps
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
    const loadStudyVariables = async () => {
      try {
        const models = await EvidenceVariableService.loadEvidenceVariables(
          "",
          "study"
        );
        const displayObjects = models.map((model) => model.toDisplayObject());
        setStudyVariables(displayObjects);
      } catch (error) {
        console.error("Error loading study variables:", error);
      }
    };
    loadStudyVariables();
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
  const validateForm = (): boolean => {
    return !!formData.selectedStudyVariable;
  };

  /**
   * Handle form submission
   */
  const handleSave = () => {
    if (validateForm()) {
      console.log("Existing Study Variable Data to save:", formData);
      onSave(formData);
    } else {
      alert(i18n.t("errormessage.selectstudyvariable"));
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

export default ExistingStudyVariableModal;