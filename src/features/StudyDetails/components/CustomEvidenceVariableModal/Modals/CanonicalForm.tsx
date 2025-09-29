// React
import { FunctionComponent, useState, useEffect } from "react";
// Translation
import i18n from "i18next";
// Components
import ExcludeCard from "../shared/ExcludeCard";
import BaseEvidenceVariableForm from "../Forms/BaseEvidenceVariableForm";
import BaseModalWrapper from "../shared/BaseModalWrapper";
// Types
import {
  CanonicalFormData,
  FormEvidenceVariableData,
} from "../../../types/evidenceVariable.types";
import { LibraryParameter } from "../../../types/library.types";
// Hooks
import { useFormValidation } from "../../../hooks/useFormValidation";
// React Bootstrap
import { Alert } from "react-bootstrap";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
// Models
import { LibraryModel } from "../../../../../shared/models/Library.model";
// Services
import LibraryService from "../../../services/library.service";

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
  // To show the alert about combination absence
  showCombinationAlert?: boolean;
  // Type of form (inclusion or study variable)
  type?: "inclusion" | "study";
  // Currently selected expression
  selectedExpression?: string;
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

  // List of available libraries
  const [libraries, setLibraries] = useState<LibraryModel[]>([]);

  // Currently available expressions for the selected library
  const [availableExpressions, setAvailableExpressions] = useState<
    LibraryParameter[]
  >([]);

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
      // Initialize form data
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
          selectedExpression: undefined,
        });
      }
      setHasChanges(false);
      // Load libraries
      const loadLibraries = async () => {
        try {
          const librariesData = await LibraryService.loadLibraries();
          setLibraries(librariesData);
        } catch (error) {
          console.error("Error loading libraries:", error);
        }
      };
      loadLibraries();
    }
  }, [props.show, props.mode, props.initialData]);

  // Update selected library and available expressions when selectedLibrary changes
  useEffect(() => {
    if (formData.evidenceVariable.selectedLibrary && libraries.length > 0) {
      const library = libraries.find(
        (lib) => lib.getId() === formData.evidenceVariable.selectedLibrary?.id
      );
      if (library) {
        const expressions = library.getExpressions();
        setAvailableExpressions(expressions);
      }
    }
  }, [formData.evidenceVariable.selectedLibrary, libraries]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate modal title based on mode
   */
  const getModalTitle = (): string => {
    const actionText =
      props.mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    if (props.type === "inclusion") {
      return `${actionText} ${i18n.t("title.newcanonicalcriteria")}`;
    } else {
      return `${actionText} ${i18n.t("title.newcanonicalstudyvariable")}`;
    }
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
    const identifierError = validateField("identifier", ev.identifier, true);
    const titleError = validateField("title", ev.title, true);
    const descError = validateField("description", ev.description, true);
    const statusError = validateField("status", ev.status, true);
    const libError = validateField(
      "selectedLibrary",
      ev.selectedLibrary?.id,
      true
    );
    const urlError = validateField("url", ev.url, true);
    // Validate expression field if type is study variable
    const expressionError =
      props.type === "study"
        ? validateField("selectedExpression", formData.selectedExpression, true)
        : null;
    // Return true if no errors
    return !(
      identifierError ||
      titleError ||
      descError ||
      statusError ||
      libError ||
      urlError ||
      expressionError
    );
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
      {/* Warning Alert */}
      {props.showCombinationAlert && (
        <Alert variant="warning" className="mb-3">
          <FontAwesomeIcon icon={faWarning} className="me-2" />
          {i18n.t("message.warningcombinationconstraint")}
        </Alert>
      )}

      {/* First Card: Exclude settings */}
      {props.type === "inclusion" && (
        <ExcludeCard
          exclude={formData.exclude}
          onChange={handleExcludeChange}
        />
      )}

      {/* Second Card: Evidence Variable Form */}
      <BaseEvidenceVariableForm
        data={formData.evidenceVariable}
        onChange={handleEvidenceVariableChange}
        readonly={false}
        type={props.type}
        errors={errors}
        validateField={validateField}
        showExpressionField={props.type === "study"}
        selectedExpression={formData.selectedExpression}
        availableExpressions={availableExpressions}
        onExpressionChange={(expressionName) =>
          setFormData((prev) => ({
            ...prev,
            selectedExpression: expressionName,
          }))
        }
      />
    </BaseModalWrapper>
  );
};

export default CanonicalForm;
