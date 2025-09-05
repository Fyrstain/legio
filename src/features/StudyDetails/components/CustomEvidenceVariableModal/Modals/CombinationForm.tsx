// React
import { FunctionComponent, useState, useEffect } from "react";
// React Bootstrap
import { Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Components
import ExcludeCard from "../shared/ExcludeCard";
import BaseModalWrapper from "../shared/BaseModalWrapper";
import FieldError from "../shared/FieldError";
// Hooks
import { useSimpleValidation } from "../../../hooks/useFormValidation";

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
}

interface CombinationFormData {
  exclude: boolean;
  code: "all-of" | "any-of" | "";
  isXor: boolean;
  combinationId: string;
}

const CombinationForm: FunctionComponent<CombinationFormProps> = ({
  show,
  onHide,
  onSave,
  mode = "create",
  initialData,
}) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [formData, setFormData] = useState<CombinationFormData>({
    exclude: false,
    code: "",
    isXor: false,
    combinationId: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { errors, validateField, clearErrors } = useSimpleValidation();

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
          code: "",
          isXor: false,
          combinationId: "",
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
    return `${actionText} ${i18n.t("title.acombination")}`;
  };

  /**
   * Get logic type options for the dropdown
   */
  const getLogicTypeOptions = () => [
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

  /**
   * Handle field changes
   */
  const handleFieldChange = (field: keyof CombinationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
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
    return !(idError || codeError);
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
    onSave(formData);
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
      code: "",
      isXor: false,
      combinationId: "",
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
        code: "",
        isXor: false,
        combinationId: "",
      });
    }
    setHasChanges(false);
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
      onClose={handleClose}
    >
      {/* First Card: Exclude settings */}
      <ExcludeCard exclude={formData.exclude} onChange={handleExcludeChange} />

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
              <FieldError error={errors?.combinationId} />
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
              <FieldError error={errors?.code} />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </BaseModalWrapper>
  );
};

export default CombinationForm;
