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
// Hooks
import { useFormValidation } from "../../../hooks/useFormValidation";

////////////////////////////////
//           Props            //
////////////////////////////////

interface CanonicalFormProps {
  // To show or hide the modal
  show: boolean;
  // Callback to hide the modal
  onHide: () => void;
  // Callback to save the data
  onSave: (data: CanonicalFormData) => void;
  // Modal mode
  mode: "create" | "update";
  // Initial data (for update mode)
  initialData?: CanonicalFormData;
}

interface CanonicalFormData {
  exclude: boolean;
  evidenceVariable: FormEvidenceVariableData;
}

const CanonicalForm: FunctionComponent<CanonicalFormProps> = (
  props: CanonicalFormProps
) => {
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

  // State to track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { errors, validateField, clearErrors } = useFormValidation();

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // Initialize form data when modal opens
  useEffect(() => {
    if (props.show) {
      clearErrors();
      if (props.mode === "update" && props.initialData) {
        setFormData(props.initialData);
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
  }, [props.show, props.mode, props.initialData]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate modal title based on mode
   */
  const getModalTitle = (): string => {
    const actionText =
      props.mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
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
   * Validate all fields and update errors state
   * Returns true if the form is valid, false otherwise
   */
  const isFormValid = (): boolean => {
    // To validate all fields, we need to access the evidenceVariable data
    const ev = formData.evidenceVariable;
    // Validate all fields
    const titleError = validateField("title", ev.title, true);
    const descError = validateField("description", ev.description, true);
    const statusError = validateField("status", ev.status, true);
    const libError = validateField(
      "selectedLibrary",
      ev.selectedLibrary?.id,
      true
    );
    const urlError = validateField("url", ev.url);
    // Return true if no errors
    return !(titleError || descError || statusError || libError || urlError);
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
      {/* First Card: Exclude settings */}
      <ExcludeCard exclude={formData.exclude} onChange={handleExcludeChange} />

      {/* Second Card: Evidence Variable Form */}
      <BaseEvidenceVariableForm
        data={formData.evidenceVariable}
        onChange={handleEvidenceVariableChange}
        readonly={false}
        type="inclusion"
        errors={errors}
        validateField={validateField}
      />
    </BaseModalWrapper>
  );
};

export default CanonicalForm;
