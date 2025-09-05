// React
import { FunctionComponent, useState, useEffect } from "react";
// Translation
import i18n from "i18next";
// Components
import ExcludeCard from "../shared/ExcludeCard";
import BaseEvidenceVariableForm from "../Forms/BaseEvidenceVariableForm";
import BaseModalWrapper from "../shared/BaseModalWrapper";
// Types
import { FormEvidenceVariableData } from "../../../types/evidenceVariable.types";

////////////////////////////////
//           Props            //
////////////////////////////////

interface CanonicalFormProps {
  /** Afficher/masquer la modal */
  show: boolean;
  /** Callback pour fermer la modal */
  onHide: () => void;
  /** Callback pour sauvegarder */
  onSave: (data: CanonicalFormData) => void;
  /** Mode de la modal */
  mode: "create" | "update";
  /** Données initiales (pour mode update) */
  initialData?: CanonicalFormData;
}

interface CanonicalFormData {
  exclude: boolean;
  evidenceVariable: FormEvidenceVariableData;
}

const CanonicalForm: FunctionComponent<CanonicalFormProps> = ({
  show,
  onHide,
  onSave,
  mode = "create",
  initialData,
}) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [formData, setFormData] = useState<CanonicalFormData>({
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
    <BaseModalWrapper
      show={show}
      onHide={onHide}
      onSave={handleSave}
      onReset={handleReset}
      title={getModalTitle()}
      isSaveEnabled={isSaveEnabled()}
      onClose={handleClose}
    >
      {/* First Card: Exclude settings */}
      <ExcludeCard exclude={formData.exclude} onChange={handleExcludeChange} />

      {/* Second Card: Evidence Variable Form */}
      <BaseEvidenceVariableForm
        data={formData.evidenceVariable}
        onChange={handleEvidenceVariableChange}
        readonly={false}
        type="inclusion"
      />
    </BaseModalWrapper>
  );
};

export default CanonicalForm;
