// React
import { FunctionComponent, useState, useEffect } from "react";
// Translation
import i18n from "i18next";
// Components
import BaseEvidenceVariableForm from "../Forms/BaseEvidenceVariableForm";
import BaseModalWrapper from "../shared/BaseModalWrapper";
// Types
import { FormEvidenceVariableData } from "../../../types/evidenceVariable.types";
// Hooks
import { useFormValidation } from "../../../hooks/useFormValidation";

////////////////////////////////
//           Props            //
////////////////////////////////

interface EvidenceVariableModalProps {
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

const EvidenceVariableModal: FunctionComponent<EvidenceVariableModalProps> = (
  props: EvidenceVariableModalProps
) => {
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
  //           Hooks            //
  ////////////////////////////////

  const { errors, validateField, clearErrors } = useFormValidation();

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // When the modal is shown, initialize or reset the form data
  useEffect(() => {
    if (props.show) {
      clearErrors();
      if (props.mode === "update" && props.initialData) {
        setFormData(props.initialData);
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
  }, [props.show, props.mode, props.initialData]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate dynamic modal title based on context
   */
  const getModalTitle = (): string => {
    const actionText =
      props.mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    if (props.type === "inclusion") {
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
  const isFormValid = (): boolean => {
    const identifierError = validateField(
      "identifier",
      formData.identifier,
      true
    );
    const titleError = validateField("title", formData.title, true);
    const descError = validateField("description", formData.description, true);
    const statusError = validateField("status", formData.status, true);
    const libError = validateField(
      "selectedLibrary",
      formData.selectedLibrary?.id,
      true
    );
    const urlError = validateField("url", formData.url);
    // Return true if no errors
    return !(
      identifierError ||
      titleError ||
      descError ||
      statusError ||
      libError ||
      urlError
    );
  };

  /**
   * Handle save action
   */
  const handleSave = () => {
    clearErrors();
    if (!isFormValid()) {
      alert(i18n.t("errormessage.fillrequiredfields"));
      return;
    }
    console.log("EvidenceVariable Data to save:", formData);
    props.onSave(formData);
  };

  /**
   * Handle close action
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
   * Handle reset action (clear form or revert to initial data)
   */
  const handleReset = () => {
    clearErrors();
    if (props.mode === "update" && props.initialData) {
      setFormData(props.initialData);
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
      {/* The component for the form using the base form */}
      <BaseEvidenceVariableForm
        data={formData}
        onChange={handleFormChange}
        type={props.type}
        errors={errors}
        validateField={validateField}
      />
    </BaseModalWrapper>
  );
};

export default EvidenceVariableModal;
