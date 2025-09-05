// React
import { FunctionComponent, useState, useEffect } from "react";
// Translation
import i18n from "i18next";
// Components
import BaseEvidenceVariableForm from "../Forms/BaseEvidenceVariableForm";
import BaseModalWrapper from "../shared/BaseModalWrapper";
// Types
import { FormEvidenceVariableData } from "../../../types/evidenceVariable.types";

////////////////////////////////
//           Props            //
////////////////////////////////

interface EvidenceVariableFormProps {
  // To show or hide the modal
  show: boolean;
  // Callback to hide the modal
  onHide: () => void;
  // Callback to save the data
  onSave: (data: FormEvidenceVariableData) => void;
  // Modal mode
  mode: "create" | "update";
  // Type of variable: inclusion criteria or study variable
  type: "inclusion" | "study";
  // Initial data (for update mode)
  initialData?: FormEvidenceVariableData;
}

const EvidenceVariableForm: FunctionComponent<EvidenceVariableFormProps> = ({
  show,
  onHide,
  onSave,
  mode = "create",
  type,
  initialData,
}) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  // State for the form data to be filled in the modal
  const [formData, setFormData] = useState<FormEvidenceVariableData>({
    title: "",
    description: "",
    identifier: "",
    status: "",
    url: "",
    selectedLibrary: undefined,
  });

  // State to track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // When the modal is shown, initialize or reset the form data
  useEffect(() => {
    if (show) {
      if (mode === "update" && initialData) {
        setFormData(initialData);
      } else {
        // Reset to empty for create mode
        setFormData({
          title: "",
          description: "",
          identifier: "",
          status: "",
          url: "",
          selectedLibrary: undefined,
        });
      }
      setHasChanges(false);
    }
  }, [show, mode, initialData]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate dynamic modal title based on context
   */
  const getModalTitle = (): string => {
    const actionText =
      mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    if (type === "inclusion") {
      return `${actionText} ${i18n.t("title.aninclusioncriteria")}`;
    }
    return `${actionText} ${i18n.t("title.astudyvariable")}`;
  };

  /**
   * To handle form changes
   */
  const handleFormChange = (data: FormEvidenceVariableData) => {
    setFormData(data);
    setHasChanges(true);
  };

  /**
   * To validate the form before saving
   */
  const validateForm = (): boolean => {
    // TODO : Implement validation logic and errors
    // Basic validation, to be extended as needed
    const requiredFields = ["title", "description", "status"];
    for (const field of requiredFields) {
      const value = formData[field as keyof FormEvidenceVariableData];
      if (!value || (typeof value === "string" && !value.trim())) {
        return false;
      }
    }
    if (!formData.selectedLibrary) {
      return false;
    }
    return true;
  };

  /**
   * Handle save action
   */
  const handleSave = () => {
    if (validateForm()) {
      console.log("Study Variable Data to save:", formData);
      onSave(formData);
      // The modal will be closed by the parent after processing
    } else {
      // Show an error message or highlight missing fields
      alert(i18n.t("errormessage.fillrequiredfields"));
    }
  };

  /**
   * Handle close action
   */
  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(i18n.t("message.unsavedchanges"));
      if (!confirmClose) return;
    }
    setFormData({
      title: "",
      description: "",
      identifier: "",
      status: "",
      url: "",
      selectedLibrary: undefined,
    });
    setHasChanges(false);
    onHide();
  };

  /**
   * Handle reset action (clear form or revert to initial data)
   */
  const handleReset = () => {
    if (mode === "update" && initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        description: "",
        identifier: "",
        status: "",
        url: "",
        selectedLibrary: undefined,
      });
    }
    setHasChanges(false);
  };

  /**
   * To check if save button should be enabled
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
      {/* The component for the form using the base form */}
      <BaseEvidenceVariableForm
        data={formData}
        onChange={handleFormChange}
        type={type}
      />
    </BaseModalWrapper>
  );
};

export default EvidenceVariableForm;
