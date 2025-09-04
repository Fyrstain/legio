// React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// React Bootstrap
import { Card, Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front Library
import { StatusSelect } from "@fyrstain/fhir-front-library";
import { FhirStatus, StatusTag } from "@fyrstain/hl7-front-library";
// Types
import { FormEvidenceVariableData } from "../../../types/evidenceVariable.types";
import { LibraryReference } from "../../../types/library.types";
// Models
import { LibraryModel } from "../../../../../shared/models/Library.model";
// Services
import LibraryService from "../../../services/library.service";

////////////////////////////////
//           Props            //
////////////////////////////////

interface BaseEvidenceVariableFormProps {
  // Data for the EvidenceVariable form
  data: FormEvidenceVariableData;
  // Callback called on changes
  onChange: (data: FormEvidenceVariableData) => void;
  // Readonly mode
  readonly?: boolean;
  // To adapt the form for inclusion criteria or study variable
  type?: "inclusion" | "study";
  // To adapt the title and some labels
  mode?: "create" | "update";
  // Display value for the library when in readonly mode
  libraryDisplayValue?: string;
}

//////////////////////////////////
//             Type             //
//////////////////////////////////

// Status options pour StatusSelect
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

const BaseEvidenceVariableForm: FunctionComponent<
  BaseEvidenceVariableFormProps
> = ({ data, onChange, readonly = false, mode, libraryDisplayValue, type }) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const navigate = useNavigate();

  // List of the Libraries using the model
  const [libraries, setLibraries] = useState<LibraryModel[]>([]);

  // Status options for the StatusSelect component
  const statusOptions: StatusOption[] = [
    { status: "advisory", statusMessage: "draft" },
    { status: "success", statusMessage: "active" },
    { status: "errorStatus", statusMessage: "retired" },
    { status: "unknown", statusMessage: "unknown" },
  ];

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  /**
   * Load libraries data on component mount.
   */
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

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  /**
   * Navigate to the error page.
   */
  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Handle field changes
   */
  const handleFieldChange = (
    field: keyof FormEvidenceVariableData,
    value: any
  ) => {
    if (readonly) return;
    onChange({
      ...data,
      [field]: value,
    });
  };

  /**
   * Handle status change from StatusSelect
   */
  const handleStatusChange = (statusMessage: string) => {
    if (statusMessage !== i18n.t("placeholder.choosestatus")) {
      handleFieldChange("status", statusMessage);
    }
  };

  /**
   * Handle library change
   */
  const handleLibraryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const libraryId = e.target.value;
    if (!libraryId) {
      handleFieldChange("selectedLibrary", undefined);
    }
    const library = libraries.find((lib) => lib.getId() === libraryId);
    if (library) {
      const libraryReference: LibraryReference =
        library.toDisplayLibraryReference();
      handleFieldChange("selectedLibrary", libraryReference);
      console.log("Selected library:", libraryReference);
    }
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Card>
      <Form>
        <Card.Header className="d-flex align-items-center gap-4">
          <Card.Title>
            {type === "inclusion"
              ? i18n.t("title.criteria")
              : i18n.t("title.studyvariables")}
          </Card.Title>
          {/* Status selector in header */}
          <Form.Group>
            {readonly ? (
              <StatusTag
                flavor={FhirStatus[data.status as keyof typeof FhirStatus]}
                message={data.status || ""}
              />
            ) : (
              <StatusSelect
                defaultSelectOption={
                  data.status || i18n.t("placeholder.choosestatus") + " *"
                }
                statusMessageArray={statusOptions}
                onChange={handleStatusChange}
                language={i18n.t}
                updateTypeTranslation=""
              />
            )}
          </Form.Group>
        </Card.Header>
        <Card.Body>
          {/* Identifier field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.identifier")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={readonly ? "" : i18n.t("placeholder.identifier")}
              value={data.identifier}
              onChange={(e) => handleFieldChange("identifier", e.target.value)}
              disabled={readonly}
            />
          </Form.Group>

          {/* Title/Name field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.name")} *</Form.Label>
            <Form.Control
              type="text"
              placeholder={readonly ? "" : i18n.t("placeholder.name")}
              value={data.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              disabled={readonly}
            />
          </Form.Group>

          {/* Description field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.generaldescription")} *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={readonly ? "" : i18n.t("placeholder.description")}
              value={data.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              disabled={readonly}
            />
          </Form.Group>

          {/* URL field */}
          <Form.Group className="mb-3">
            <Form.Label>URL</Form.Label>
            <Form.Control
              type="text"
              placeholder={readonly ? "" : i18n.t("placeholder.url")}
              value={data.url || ""}
              onChange={(e) => handleFieldChange("url", e.target.value)}
              disabled={readonly}
            />
          </Form.Group>

          {/* Library field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.library")} *</Form.Label>
            {readonly ? (
              <Form.Control
                type="text"
                value={libraryDisplayValue || "N/A"}
                disabled={readonly}
              />
            ) : (
              <>
                <Form.Select
                  value={data.selectedLibrary?.id || ""}
                  onChange={handleLibraryChange}
                >
                  <option value="">{i18n.t("placeholder.library")}</option>
                  {libraries.map((library) => (
                    <option key={library.getId()} value={library.getId()}>
                      {library.getName()} - {library.getUrl()}
                    </option>
                  ))}
                </Form.Select>
              </>
            )}
          </Form.Group>
        </Card.Body>
      </Form>
    </Card>
  );
};

export default BaseEvidenceVariableForm;
