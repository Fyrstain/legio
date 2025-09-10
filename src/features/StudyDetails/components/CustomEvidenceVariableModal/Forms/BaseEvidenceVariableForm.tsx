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
  // Validation errors
  errors?: { [field: string]: string };
  // Validate fields callback
  validateField: (fieldName: string, value: any, isRequired?: boolean) => string | null;
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
> = (props: BaseEvidenceVariableFormProps) => {
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
    value: any,
    isRequired: boolean
  ) => {
    if (props.readonly) return;
    props.onChange({
      ...props.data,
      [field]: value,
    });
    props.validateField(field, value, isRequired);
  };

  /**
   * Handle status change from StatusSelect
   */
  const handleStatusChange = (statusMessage: string) => {
    if (statusMessage !== i18n.t("placeholder.choosestatus")) {
      handleFieldChange("status", statusMessage, true);
    }
  };

  /**
   * Handle library change
   */
  const handleLibraryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const libraryId = e.target.value;
    if (!libraryId) {
      handleFieldChange("selectedLibrary", undefined, e.target.required);
    }
    const library = libraries.find((lib) => lib.getId() === libraryId);
    if (library) {
      const libraryReference: LibraryReference =
        library.toDisplayLibraryReference();
      handleFieldChange("selectedLibrary", libraryReference, e.target.required);
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
            {props.type === "inclusion"
              ? i18n.t("title.criteria")
              : i18n.t("title.studyvariables")}
          </Card.Title>
          {/* Status selector in header */}
          <Form.Group>
            {props.readonly ? (
              <StatusTag
                flavor={
                  FhirStatus[props.data.status as keyof typeof FhirStatus]
                }
                message={props.data.status || ""}
              />
            ) : (
              <div className={props.errors?.status ? "is-invalid" : ""}>
                <StatusSelect
                  defaultSelectOption={
                    props.data.status ||
                    i18n.t("placeholder.choosestatus") + " *"
                  }
                  statusMessageArray={statusOptions}
                  onChange={handleStatusChange}
                  language={i18n.t}
                  updateTypeTranslation=""
                />
              </div>
            )}
            <Form.Control.Feedback type="invalid">
              {props.errors?.status}
            </Form.Control.Feedback>
          </Form.Group>
        </Card.Header>
        <Card.Body>
          {/* Identifier field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.identifier")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={i18n.t("placeholder.identifier")}
              value={props.data.identifier}
              onChange={(e) => handleFieldChange("identifier", e.target.value, false)}
              disabled={props.readonly}
            />
          </Form.Group>

          {/* Title/Name field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.name")} *</Form.Label>
            <Form.Control
              type="text"
              placeholder={i18n.t("placeholder.name")}
              value={props.data.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value, true)}
              disabled={props.readonly}
              isInvalid={!!props.errors?.title}
            />
            <Form.Control.Feedback type="invalid">
              {props.errors?.title}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Description field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.generaldescription")} *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={i18n.t("placeholder.description")}
              value={props.data.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value, true)}
              disabled={props.readonly}
              isInvalid={!!props.errors?.description}
            />
            <Form.Control.Feedback type="invalid">
              {props.errors?.description}
            </Form.Control.Feedback>
          </Form.Group>

          {/* URL field */}
          <Form.Group className="mb-3">
            <Form.Label>URL</Form.Label>
            <Form.Control
              type="text"
              placeholder={i18n.t("placeholder.url")}
              value={props.data.url || ""}
              onChange={(e) => handleFieldChange("url", e.target.value, false)}
              disabled={props.readonly}
              isInvalid={!!props.errors?.url}
            />
            <Form.Control.Feedback type="invalid">
              {props.errors?.url}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Library field */}
          <Form.Group className="mb-3">
            <Form.Label>{i18n.t("label.library")} *</Form.Label>
            {props.readonly ? (
              <Form.Control
                type="text"
                value={props.libraryDisplayValue || "N/A"}
                disabled={props.readonly}
                isInvalid={!!props.errors?.selectedLibrary}
              />
            ) : (
              <Form.Select
                value={props.data.selectedLibrary?.id || ""}
                onChange={handleLibraryChange}
                isInvalid={!!props.errors?.selectedLibrary}
              >
                <option value="">{i18n.t("placeholder.library")}</option>
                {libraries.map((library) => (
                  <option key={library.getId()} value={library.getId()}>
                    {library.getName()} - {library.getUrl()}
                  </option>
                ))}
              </Form.Select>
            )}
            <Form.Control.Feedback type="invalid">
              {props.errors?.selectedLibrary}
            </Form.Control.Feedback>
          </Form.Group>
        </Card.Body>
      </Form>
    </Card>
  );
};

export default BaseEvidenceVariableForm;
