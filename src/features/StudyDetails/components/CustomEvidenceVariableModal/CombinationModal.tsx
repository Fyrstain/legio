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

////////////////////////////////
//           Props            //
////////////////////////////////

interface CombinationModalProps {
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

const CombinationModal: FunctionComponent<CombinationModalProps> = ({
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
  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.combinationId?.trim()) {
      return false;
    }
    if (!formData.code) {
      return false;
    }
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSave = () => {
    if (validateForm()) {
      console.log("Combination Data to save:", formData);
      onSave(formData);
      // Modal will be closed by parent after processing
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
        <ExcludeCard
          exclude={formData.exclude}
          onChange={handleExcludeChange}
        />

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
                  onChange={(e) => handleFieldChange("combinationId", e.target.value)}
                />
              </Form.Group>

              {/* Logic type selection */}
              <Form.Group className="mb-3">
                <Form.Label>{i18n.t("label.logictype")} *</Form.Label>
                <Form.Select
                  value={getCurrentLogicType()}
                  onChange={handleLogicTypeChange}
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
              </Form.Group>
            </Form>
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

export default CombinationModal;