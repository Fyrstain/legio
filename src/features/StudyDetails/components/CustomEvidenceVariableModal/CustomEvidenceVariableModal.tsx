// React
import { FunctionComponent, useState } from "react";
// React Bootstrap
import { Modal, Button, Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front library
import { Title } from "@fyrstain/hl7-front-library";
// Components
import ConditionalFieldsContainer from "./ConditionalFieldsContainer";
// Types
import {
  EvidenceVariableProps,
  EvidenceVariableType,
  ModalMode,
  EvidenceVariableLogicType,
  InclusionCriteriaTypes,
} from "../../types/evidenceVariable.types";

////////////////////////////////
//           Props            //
////////////////////////////////

interface CustomEvidenceVariableModalProps {
  // to show or hide the modal
  show: boolean;
  // to hide the modal
  onHide: () => void;
  // to save the evidence variable
  onSave?: (evidenceVariable: EvidenceVariableProps) => void;
  // existing evidence variable to update, or undefined for creation
  evidenceVariable?: EvidenceVariableProps;
  // mode of the modal, either create or update
  mode?: ModalMode;
  // type of the evidence variable, either inclusion or study
  evidenceVariableType?: EvidenceVariableType;
  // logic type for the evidence variable, either XOR, OR, or AND
  logicType?: EvidenceVariableLogicType;
  // criteria types for the evidence variable, either boolean, integer, date, code[]
  criteriaTypes?: InclusionCriteriaTypes;
}

const CustomEvidenceVariableModal: FunctionComponent<
  CustomEvidenceVariableModalProps
> = ({
  show,
  onHide,
  onSave,
  evidenceVariable,
  mode,
  evidenceVariableType,
  logicType,
}) => {
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  const [formData, setFormData] = useState<EvidenceVariableProps>({
    title: evidenceVariable?.title || "",
    description: evidenceVariable?.description || "",
    expression: evidenceVariable?.expression || "",
    id: evidenceVariable?.id || "",
  });

  // State for the list of the libraries
  const [libraries, setLibraries] = useState<{ id: string; name: string }[]>(
    []
  );

  // State for the selected library
  const [librarySelected, setLibrarySelected] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // State for the list of expressions from the Library
  const [expressions, setExpressions] = useState<
    { id: string; name: string }[]
  >([]);

  // State for the selected expression
  const [selectedExpression, setSelectedExpression] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [criteriaValue, setCriteriaValue] = useState<{
    type: InclusionCriteriaTypes;
    value?: any;
  }>({
    type: "" as InclusionCriteriaTypes,
    value: undefined,
  });

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Generate dynamic modal title based on context
   */
  const generateModalTitle = (): string => {
    // Generate title based on mode, type, and logic
    const actionText =
      mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
    const typeText =
      evidenceVariableType === "inclusion"
        ? i18n.t("title.aninclusioncriteria")
        : i18n.t("title.astudyvariable");
    
    // If we have a logic type, include it in the title
    if (logicType) {
      return `${actionText} ${typeText} ${logicType}`;
    }
    
    // Otherwise, just use action + type
    return `${actionText} ${typeText}`;
  };

  /**
   * Function to handle input changes
   * @param field is the field of the EvidenceVariableProps to update
   * @param value is the new value for the field
   */
  const handleInputChange = (
    field: keyof EvidenceVariableProps,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Function to handle library selection change
   * @param libraryId is the ID of the selected library
   */
  const handleLibraryChange = (libraryId: string) => {
    const library = null;
    setLibrarySelected(library);
    setFormData((prev) => ({
      ...prev,
      library: library,
    }));
  };

  /**
   * Function to handle expression selection change
   * @param expressionId is the ID of the selected expression
   */
  const handleExpressionChange = (expressionId: string) => {
    const expression =
      expressions.find((expr) => expr.id === expressionId) || null;
    setSelectedExpression(expression);
    setFormData((prev) => ({
      ...prev,
      expression: expression ? expression.id : "",
    }));
  };

  /**
   * Function to handle criteria value change
   * @param value is the new value for the criteria
   */
  function handleCriteriaValueChange(value: {
    type: InclusionCriteriaTypes;
    value?: any;
  }): void {
    setCriteriaValue(value);
    setFormData((prev) => ({
      ...prev,
      criteriaValue: value,
    }));
  }

  /**
   * Handle form submission
   */
  const handleSave = () => {
    if (formData.title.trim() && formData.description.trim()) {
      if (onSave) {
        onSave(formData);
      }
    }
    onHide();
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    onHide();
  };

  /**
   * Function to handle reset action
   * Resets the form data to the initial state or to the provided evidence variable
   * @param event is the mouse event triggered by the reset button
   */
  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      expression: "",
      id: "",
    });
    setLibrarySelected(null);
    setSelectedExpression(null);
    setCriteriaValue({
      type: "" as InclusionCriteriaTypes,
      value: undefined,
    });
    setLibraries([]);
    setExpressions([]);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Title level={2} content={generateModalTitle()} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Title of the Evidence Variable */}
          <Form.Group className="mb-3">
            {/* We use the "title" field from FHIR, but we call it "name" */}
            <Form.Label>{i18n.t("label.name")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={i18n.t("placeholder.name")}
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </Form.Group>

          {/* Description of the Evidence Variable */}
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              placeholder={i18n.t("placeholder.description")}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </Form.Group>

          {/* Library selection */}
          {evidenceVariableType === "inclusion" && (
            <Form.Group className="mb-3">
              <Form.Label>{i18n.t("label.library")}</Form.Label>
              <Form.Select
                value={librarySelected?.id || ""}
                onChange={(e) => handleLibraryChange(e.target.value)}
              >
                <option value="">{i18n.t("placeholder.library")}</option>
                {libraries.map((library) => (
                  <option key={library.id} value={library.id}>
                    {library.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* Expression selection */}
          {evidenceVariableType === "inclusion" && (
            <Form.Group className="mb-3">
              <Form.Label>Expression</Form.Label>
              <Form.Select
                value={selectedExpression?.id || ""}
                onChange={(e) => handleExpressionChange(e.target.value)}
                disabled={!librarySelected || libraries.length === 0}
              >
                <option value="">{i18n.t("placeholder.expression")}</option>
                {expressions.map((expression) => (
                  <option key={expression.id} value={expression.id}>
                    {expression.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* Inclusion Criteria Type selection */}
          {evidenceVariableType === "inclusion" && (
            <ConditionalFieldsContainer
              value={criteriaValue}
              onChange={handleCriteriaValueChange}
            />
          )}
        </Form>
      </Modal.Body>

      {/* Modal Footer with Save and Reset buttons */}
      <Modal.Footer>
        <Button variant="primary" onClick={handleSave}>
          {i18n.t("button.save")}
        </Button>
        <Button variant="secondary" onClick={handleReset}>
          {i18n.t("button.reset")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomEvidenceVariableModal;
