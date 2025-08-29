// React
import {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
// React Bootstrap
import { Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front Library
import { StatusSelect } from "@fyrstain/fhir-front-library";
// Hook
import { useEvidenceVariableForm } from "../../../hooks/useEvidenceVariableForm";
// Types
import {
  EvidenceVariableFormType,
  EvidenceVariableProps,
  EvidenceVariableFormData,
} from "../../../types/evidenceVariable.types";
// Models
import { LibraryModel } from "../../../../../shared/models/Library.model";
// Services
import LibraryService from "../../../services/library.service";

//////////////////////////////////
//             Type             //
//////////////////////////////////

// Status options for the dropdown
type StatusOption = {
  status:
    | "success"
    | "suspended"
    | "errorStatus"
    | "advisory"
    | "info"
    | "unknown";
  statusMessage: string;
};

////////////////////////////////
//           Props            //
////////////////////////////////

interface FirstGroupFormProps {
  formType: EvidenceVariableFormType;
  initialEvidenceVariable?: EvidenceVariableProps;
  initialFormData?: EvidenceVariableFormData;
}

const FirstGroupForm: FunctionComponent<FirstGroupFormProps> = ({
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
    handleDescriptionChange,
    handleStatusChange,
    handleLibraryChange,
  } = useEvidenceVariableForm(
    formType,
    initialEvidenceVariable,
    initialFormData
  );

  /////////////////////////////////////
  //             State               //
  /////////////////////////////////////

  const navigate = useNavigate();

  // State for the libraries
  const [libraries, setLibraries] = useState<LibraryModel[]>([]);

  // Status options for the StatusSelect component
  const statusOptions: StatusOption[] = [
    { status: "advisory", statusMessage: "draft" },
    { status: "success", statusMessage: "active" },
    { status: "errorStatus", statusMessage: "retired" },
    { status: "unknown", statusMessage: "unknown" },
  ];

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

  // To load libraries data
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

  //////////////////////////////////
  //            Actions           //
  //////////////////////////////////

  /**
   * Handle status change from StatusSelect
   */
  const handleStatusSelectChange = (statusMessage: string) => {
    if (statusMessage !== i18n.t("placeholder.choosestatus")) {
      handleStatusChange(statusMessage);
    }
  };

  /**
   * Handle library selection change
   */
  const handleLibrarySelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const libraryId = e.target.value;
    if (!libraryId) {
      handleLibraryChange(undefined);
      return;
    }
    // To find the selected library
    const selectedLibrary = libraries.find((lib) => lib.getId() === libraryId);
    if (selectedLibrary) {
      const libraryReference = selectedLibrary.toDisplayLibraryReference();
      handleLibraryChange(libraryReference);
      console.log("Selected library:", libraryReference);
    }
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Card>
      <Card.Header className="d-flex align-items-center gap-4">
        <Card.Title>{i18n.t("title.firstgroup")}</Card.Title>
        {/* Status selector in header */}
        <StatusSelect
          defaultSelectOption={
            evidenceVariableData.status || i18n.t("placeholder.choosestatus")
          }
          statusMessageArray={statusOptions}
          onChange={handleStatusSelectChange}
          language={i18n.t}
          updateTypeTranslation={""}
        />
      </Card.Header>

      <Card.Body>
        <Form>
          {/* Identifier field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.identifier")} *</Form.Label>
            <Form.Control
              type="text"
              placeholder={i18n.t("placeholder.identifier")}
              value={evidenceVariableData.identifier || ""}
              onChange={handleIdentifierChange}
              required
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

          {/* Library field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.library")}</Form.Label>
            <Form.Select
              value={formData.selectedLibrary?.id || ""}
              onChange={handleLibrarySelectChange}
            >
              <option value="">{i18n.t("placeholder.library")}</option>
              {libraries.map((library) => (
                <option key={library.getId()} value={library.getId()}>
                  {library.getName()} - {library.getUrl()}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FirstGroupForm;
