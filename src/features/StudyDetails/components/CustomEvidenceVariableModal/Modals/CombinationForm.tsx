// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Components
import ExcludeCard from "../shared/ExcludeCard";
import BaseModalWrapper from "../shared/BaseModalWrapper";
// Hooks
import { useFormValidation } from "../../../hooks/useFormValidation";
// Types
import { CombinationFormData } from "../../../types/evidenceVariable.types";

////////////////////////////////
//           Props            //
////////////////////////////////

interface CombinationFormProps {
  // To show or hide the modal
  show: boolean;
  // Callback to hide the modal
  onHide: () => void;
  // Callback to save the data
  onSave: (data: CombinationFormData) => void;
  // Modal mode
  mode: "create" | "update";
  // Initial data (for update mode)
  initialData?: CombinationFormData;
  // Type of form (inclusion or study variable)
  type?: "inclusion" | "study";
}

const CombinationForm: FunctionComponent<CombinationFormProps> = (
  props: CombinationFormProps
) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [formData, setFormData] = useState<CombinationFormData>({
    exclude: false,
    code: undefined,
    isXor: false,
    combinationId: "",
    combinationDescription: "",
  });

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
          code: props.type === "study" ? "dataset" : undefined,
          isXor: false,
          combinationId: "",
          combinationDescription: "",
        });
      }
      setHasChanges(false);
    }
  }, [props.show, props.mode, props.initialData, props.type]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate modal title based on mode
   */
  const getModalTitle = (): string => {
    const actionText =
      props.mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    return `${actionText} ${i18n.t("title.acombination")}`;
  };

  /**
   * Get logic type options for the dropdown
   */
  const getLogicTypeOptions = () => {
    if (props.type === "study") {
      return [
        {
          value: "dataset",
          label: "Dataset",
        },
      ];
    }
    return [
      {
        value: "all-of",
        label: i18n.t("label.and"),
      },
      {
        value: "any-of",
        label: i18n.t("label.or"),
      },
      {
        value: "any-of-xor",
        label: i18n.t("label.xor"),
      },
    ];
  };

  /**
   * Handle field changes
   */
  const handleFieldChange = (field: keyof CombinationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    validateField(field, value, true);
  };

  /**
   * Handle exclude change from ExcludeCard
   */
  const handleExcludeChange = (exclude: boolean) => {
    handleFieldChange("exclude", exclude);
  };

  /**
   * Handle logic type change
   */
  const handleLogicTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "any-of-xor") {
      setFormData((prev) => ({
        ...prev,
        code: "any-of",
        isXor: true,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        code: value as "all-of" | "any-of",
        isXor: false,
      }));
    }
    setHasChanges(true);
    validateField("code", value, true);
  };

  /**
   * Get current logic type value for display
   */
  const getCurrentLogicType = (): string => {
    if (!formData.code) return "";
    if (formData.isXor && formData.code === "any-of") {
      return "any-of-xor";
    }
    return formData.code;
  };

  /**
   * Validate form data
   */
  const isFormValid = (): boolean => {
    const idError = validateField(
      "combinationId",
      formData.combinationId,
      true
    );
    const codeError = validateField("code", formData.code, true);
    const descriptionError = validateField(
      "combinationDescription",
      formData.combinationDescription,
      true
    );
    return !(idError || codeError || descriptionError);
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
    console.log("Combination Data to save:", formData);
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
        code: undefined,
        isXor: false,
        combinationId: "",
        combinationDescription: "",
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
      {props.type === "inclusion" && (
        <ExcludeCard
          exclude={formData.exclude}
          onChange={handleExcludeChange}
        />
      )}

      {/* Second Card: Combination definition */}
      <Card>
        <Card.Header>
          <Card.Title>{i18n.t("title.combinationdefinition")}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* ID field */}
            <Form.Group className="mb-3">
              <Form.Label>ID *</Form.Label>
              <Form.Control
                type="text"
                placeholder={i18n.t("placeholder.id")}
                value={formData.combinationId}
                onChange={(e) =>
                  handleFieldChange("combinationId", e.target.value)
                }
                isInvalid={!!errors?.combinationId}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.combinationId}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Description field */}
            <Form.Group className="mb-3">
              <Form.Label>{i18n.t("label.generaldescription")} *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={i18n.t("placeholder.description")}
                value={formData.combinationDescription}
                onChange={(e) =>
                  handleFieldChange("combinationDescription", e.target.value)
                }
                isInvalid={!!errors?.combinationDescription}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.combinationDescription}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Logic type selection */}
            <Form.Group className="mb-3">
              <Form.Label>{i18n.t("label.logictype")} *</Form.Label>
              <Form.Select
                value={getCurrentLogicType()}
                onChange={handleLogicTypeChange}
                isInvalid={!!errors?.code}
              >
                <option value="" disabled hidden>
                  {i18n.t("placeholder.logicaloperator")}
                </option>
                {getLogicTypeOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors?.code}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </BaseModalWrapper>
  );
};

export default CombinationForm;
