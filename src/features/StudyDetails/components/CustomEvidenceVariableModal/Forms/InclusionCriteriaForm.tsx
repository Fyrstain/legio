// React
import {
  FunctionComponent,
  useEffect,
  useState,
  ChangeEvent,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
// React Bootstrap
import { Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Hook
import { useEvidenceVariableForm } from "../../../hooks/useEvidenceVariableForm";
// Services
import LibraryService from "../../../services/library.service";
// Models
import { LibraryModel } from "../../../../../shared/models/Library.model";
// Components
import ConditionalFieldsContainer from "../ConditionalFieldsContainer";
// Types
import {
  EvidenceVariableFormType,
  EvidenceVariableProps,
  EvidenceVariableFormData,
  InclusionCriteriaValue,
} from "../../../types/evidenceVariable.types";
import { LibraryParameter } from "../../../types/library.types";
// Utils
import { getUITypeFromLibraryParameter } from "../../../../../shared/utils/libraryParameterMapping";

////////////////////////////////
//           Props            //
////////////////////////////////

interface InclusionCriteriaFormProps {
  formType: EvidenceVariableFormType;
  initialEvidenceVariable?: EvidenceVariableProps;
  initialFormData?: EvidenceVariableFormData;
}

const InclusionCriteriaForm: FunctionComponent<InclusionCriteriaFormProps> = ({
  formType,
  initialEvidenceVariable,
  initialFormData,
}) => {
  // Use the existing hook
  const {
    evidenceVariableData,
    formData,
    handleIdentifierChange,
    handleTitleChange,
    handleStatusChange,
    handleDescriptionChange,
    handleIsExcludedChange,
    handleLibraryChange,
    handleExpressionChange,
    handleParameterChange,
    handleCriteriaValueChange,
  } = useEvidenceVariableForm(
    formType,
    initialEvidenceVariable,
    initialFormData
  );

  /////////////////////////////////////
  //             State               //
  /////////////////////////////////////

  const navigate = useNavigate();

  // State for libraries and their parameters
  const [libraries, setLibraries] = useState<LibraryModel[]>([]);
  // State for available expressions (from the selected library, Library.parameter with use ="out" and boolean type)
  const [availableExpressions, setAvailableExpressions] = useState<
    LibraryParameter[]
  >([]);
  // State for available parameters (from the selected library, Library.parameter with use ="in")
  const [availableParameters, setAvailableParameters] = useState<
    LibraryParameter[]
  >([]);
  // State for the selected library
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryModel | null>(
    null
  );

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  /**
   * Navigate to the error page.
   */
  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  /////////////////////////////////////
  //           LifeCycle             //
  /////////////////////////////////////

  // Load libraries on component mount
  useEffect(() => {
    const loadLibrariesData = async () => {
      try {
        const librariesData = await LibraryService.loadLibraries();
        setLibraries(librariesData);
      } catch (error) {
        onError();
      }
    };
    loadLibrariesData();
  }, []);

  // Update expressions and parameters when library changes
  useEffect(() => {
    if (selectedLibrary) {
      setAvailableExpressions(selectedLibrary.getExpressions());
      setAvailableParameters(selectedLibrary.getInputParameters());
    } else {
      setAvailableExpressions([]);
      setAvailableParameters([]);
    }
  }, [selectedLibrary]);

  //////////////////////////////////
  //            Actions           //
  //////////////////////////////////

  // Check if obsolete based on status
  const isObsolete = evidenceVariableData.status === "retired";

  /**
   * Handle obsolete toggle
   */
  const handleObsoleteToggle = (e: ChangeEvent<HTMLInputElement>) => {
    // This is handled via status change - obsolete = status "retired"
    const newStatus = e.target.checked ? "retired" : "active";
    handleStatusChange(newStatus);
  };

  /**
   * Handle library selection change
   */
  const handleLibrarySelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const libraryId = e.target.value;
    // Reset the selected library if no library is selected
    if (!libraryId) {
      setSelectedLibrary(null);
      handleLibraryChange(undefined);
      return;
    }
    // Find the selected library
    const library = libraries.find((lib) => lib.getId() === libraryId);
    if (library) {
      setSelectedLibrary(library);
      const libraryReference = library.toDisplayLibraryReference();
      handleLibraryChange(libraryReference);
      // Reset dependent fields when library changes
      handleExpressionChange("");
      handleParameterChange("");
    }
  };

  /**
   * Handle inclusion/exclusion radio change
   */
  const handleInclusionExclusionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isExcluded = e.target.value === "exclusion";
    handleIsExcludedChange(isExcluded);
  };

  /**
   * Handle library parameter type change
   */
  const handleParameterSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const parameterName = e.target.value;
    handleParameterChange(parameterName);
    if (parameterName && selectedLibrary) {
      const parameter = availableParameters.find(
        (p) => p.name === parameterName
      );
      if (parameter) {
        const uiType = getUITypeFromLibraryParameter(parameter.type);
        handleCriteriaValueChange({
          type: uiType,
          value: undefined,
        });
      }
    }
  };

  /**
   * Handle criteria value change from ConditionalFieldsContainer
   */
  const handleConditionalFieldChange = (value: InclusionCriteriaValue) => {
    handleCriteriaValueChange(value);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Card>
      <Card.Header className="d-flex align-items-center gap-4">
        <Card.Title>{i18n.t("title.inclusioncriteria")}</Card.Title>

        {/* Toggle Obsolete/Non-obsolete */}
        <Form.Check
          type="switch"
          id="obsolete-switch"
          label={
            isObsolete ? i18n.t("label.obsolete") : i18n.t("label.notobsolete")
          }
          checked={isObsolete}
          onChange={handleObsoleteToggle}
        />
      </Card.Header>

      <Card.Body>
        <Form>
          {/* Identifier field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.identifier")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={i18n.t("placeholder.identifier")}
              value={evidenceVariableData.identifier || ""}
              onChange={handleIdentifierChange}
            />
          </Form.Group>

          {/* Name/Title field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.name")} *</Form.Label>
            <Form.Control
              type="text"
              placeholder={i18n.t("placeholder.name")}
              value={evidenceVariableData.title}
              onChange={handleTitleChange}
              required
            />
          </Form.Group>

          {/* Description field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.generaldescription")} *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={i18n.t("placeholder.description")}
              value={evidenceVariableData.description}
              onChange={handleDescriptionChange}
              required
            />
          </Form.Group>

          {/* Inclusion/Exclusion radio buttons */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.criteriatype")}</Form.Label>
            <div className="mt-2">
              <Form.Check
                inline
                type="radio"
                name="inclusionExclusion"
                id="inclusion-radio"
                label="Inclusion"
                value="inclusion"
                checked={!evidenceVariableData.isExcluded}
                onChange={handleInclusionExclusionChange}
              />
              <Form.Check
                inline
                type="radio"
                name="inclusionExclusion"
                id="exclusion-radio"
                label="Exclusion"
                value="exclusion"
                checked={evidenceVariableData.isExcluded}
                onChange={handleInclusionExclusionChange}
              />
            </div>
          </Form.Group>

          {/* Library dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.library")} *</Form.Label>
            <Form.Select
              value={formData.selectedLibrary?.id || ""}
              onChange={handleLibrarySelectChange}
              required
            >
              <option value="">{i18n.t("placeholder.library")}</option>
              {libraries.map((library) => (
                <option key={library.getId()} value={library.getId()}>
                  {library.getName()} - {library.getUrl()}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Expression dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>Expression *</Form.Label>
            <Form.Select
              value={formData.selectedExpression || ""}
              onChange={(e) => handleExpressionChange(e.target.value)}
              disabled={!selectedLibrary || availableExpressions.length === 0}
              required
            >
              <option value="">{i18n.t("placeholder.expression")}</option>
              {availableExpressions.map((expression) => (
                <option key={expression.name} value={expression.name}>
                  {expression.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Parameter dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.parameter")}</Form.Label>
            <Form.Select
              value={formData.selectedParameter || ""}
              onChange={handleParameterSelectChange}
              disabled={!selectedLibrary || availableParameters.length === 0}
            >
              <option value="">{i18n.t("placeholder.parameter")}</option>
              {availableParameters.map((parameter) => (
                <option
                  key={parameter.name}
                  value={parameter.name}
                  title={parameter.documentation}
                >
                  {parameter.name} ({parameter.type})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Conditional Fields based on selected parameter */}
          {formData.selectedParameter && (
            <ConditionalFieldsContainer
              value={
                formData.criteriaValue || { type: "boolean", value: undefined }
              }
              onChange={handleConditionalFieldChange}
            />
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default InclusionCriteriaForm;