// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Modal, Button } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front library
import { Title } from "@fyrstain/hl7-front-library";
// Components
import ExcludeCard from "./Forms/ExcludeCard";
import BaseEvidenceVariableForm from "./Forms/BaseEvidenceVariableForm";
// Types
import { FormEvidenceVariableData } from "../../types/evidenceVariable.types";

////////////////////////////////
//           Props            //
////////////////////////////////

interface NewCanonicalModalProps {
  /** Afficher/masquer la modal */
  show: boolean;
  /** Callback pour fermer la modal */
  onHide: () => void;
  /** Callback pour sauvegarder */
  onSave: (data: NewCanonicalFormData) => void;
  /** Mode de la modal */
  mode: "create" | "update";
  /** Données initiales (pour mode update) */
  initialData?: NewCanonicalFormData;
}

interface NewCanonicalFormData {
  exclude: boolean;
  evidenceVariable: FormEvidenceVariableData;
}

const NewCanonicalModal: FunctionComponent<NewCanonicalModalProps> = ({
  show,
  onHide,
  onSave,
  mode = "create",
  initialData,
}) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [formData, setFormData] = useState<NewCanonicalFormData>({
    exclude: false,
    evidenceVariable: {
      title: "",
      description: "",
      identifier: "",
      status: "",
      url: "",
      selectedLibrary: undefined,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // Initialize form data when modal opens
  useEffect(() => {
    if (show) {
      if (mode === "update" && initialData) {
        setFormData(initialData);
      } else {
        // Reset for create mode
        setFormData({
          exclude: false,
          evidenceVariable: {
            title: "",
            description: "",
            identifier: "",
            status: "",
            url: "",
            selectedLibrary: undefined,
          },
        });
      }
      setHasChanges(false);
    }
  }, [show, mode, initialData]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate modal title based on mode
   */
  const getModalTitle = (): string => {
    const actionText =
      mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    return `${actionText} ${i18n.t("title.newcanonicalcriteria")}`;
  };

  /**
   * Handle exclude change from ExcludeCard
   */
  const handleExcludeChange = (exclude: boolean) => {
    setFormData((prev) => ({ ...prev, exclude }));
    setHasChanges(true);
  };

  /**
   * Handle evidence variable form changes
   */
  const handleEvidenceVariableChange = (
    evidenceVariable: FormEvidenceVariableData
  ) => {
    setFormData((prev) => ({ ...prev, evidenceVariable }));
    setHasChanges(true);
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const { evidenceVariable } = formData;
    // Check required fields for evidence variable
    const requiredFields = ["title", "description", "status"];
    for (const field of requiredFields) {
      const value = evidenceVariable[field as keyof FormEvidenceVariableData];
      if (!value || (typeof value === "string" && !value.trim())) {
        return false;
      }
    }
    // Check if library is selected
    if (!evidenceVariable.selectedLibrary) {
      return false;
    }
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSave = () => {
    if (validateForm()) {
      console.log("New Canonical Data to save:", formData);
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

    setFormData({
      exclude: false,
      evidenceVariable: {
        title: "",
        description: "",
        identifier: "",
        status: "",
        url: "",
        selectedLibrary: undefined,
      },
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
        evidenceVariable: {
          title: "",
          description: "",
          identifier: "",
          status: "",
          url: "",
          selectedLibrary: undefined,
        },
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
    <Modal show={show} onHide={handleClose} size="xl" centered>
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

        {/* Second Card: Evidence Variable Form */}
        <BaseEvidenceVariableForm
          data={formData.evidenceVariable}
          onChange={handleEvidenceVariableChange}
          readonly={false}
          type="inclusion"
        />
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

export default NewCanonicalModal;