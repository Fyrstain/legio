// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Card, Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front library
import { FhirStatus, StatusTag, Title } from "@fyrstain/hl7-front-library";
// Fhir Front Library
import { StatusSelect } from "@fyrstain/fhir-front-library";

////////////////////////////////
//           Props            //
////////////////////////////////

interface FieldConfig {
  label: string;
  value: any;
  type?: "status" | "text" | "textarea" | "select";
  editable?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export interface InformationSectionProps {
  fields: FieldConfig[];
  isEditing?: boolean;
}

//////////////////////////////////
//             Type             //
//////////////////////////////////

// Links the TestScript status to a display type for the dropdown
type StatusMenu = {
  status:
    | "success"
    | "suspended"
    | "errorStatus"
    | "advisory"
    | "info"
    | "unknown";
  statusMessage: string;
};

const InformationSection: FunctionComponent<InformationSectionProps> = ({
  fields,
  isEditing = false,
}) => {
  //////////////////////////////////
  //            Options           //
  //////////////////////////////////

  // Options for the status select
  // TODO Use a valueSet
  const statusOptions: StatusMenu[] = [
    { status: "advisory", statusMessage: "draft" },
    { status: "success", statusMessage: "active" },
    { status: "info", statusMessage: "retired" },
    { status: "unknown", statusMessage: "unknown" },
  ];

  const renderReadOnlyField = (field: FieldConfig, index: number) => (
    <div key={index}>
      {field.type !== "status" && (
        <div className="gap-2">
          <Form.Label className="fw-semibold me-2 mb-0">
            {field.label} :
          </Form.Label>
          <Form.Text className="mt-0">{field.value}</Form.Text>
        </div>
      )}
      {field.type === "status" && (
        <div className="d-flex gap-2">
          <Form.Label className="fw-bold mb-0">{field.label} :</Form.Label>
          <Form.Text className="mt-0">
            <StatusTag
              flavor={FhirStatus[field.value as keyof typeof FhirStatus]}
              message={field.value}
            />
          </Form.Text>
        </div>
      )}
    </div>
  );

  // Find the status field from the fields array
  const statusField = fields.find((field) => field.type === "status");

  // Renders the editable status field
  const renderEditableFieldOnHeader = (field: FieldConfig) => {
    if (field.type === "status") {
      const defaultSelectStatusOption =
        !field.value || field.value === "N/A"
          ? i18n.t("placeholder.choosestatus") || "Choisir un statut"
          : field.value;

      /**
       * Handle the change of the status message
       */
      const handleStatusChange = (statusMessage: string) => {
        if (
          statusMessage !==
          (i18n.t("placeholder.choosestatus"))
        ) {
          field.onChange?.(statusMessage);
        }
      };

      return (
        <StatusSelect
          defaultSelectOption={defaultSelectStatusOption}
          statusMessageArray={statusOptions}
          onChange={handleStatusChange}
          language={i18n.t}
          updateTypeTranslation={""}
        />
      );
    }
    return null;
  };

  const renderEditableField = (field: FieldConfig, index: number) => {
    const isFieldEditable = field.editable !== false;
    // const options = getFieldOptions(field);
    if (!isFieldEditable) {
      return (
        <Form.Group key={index} className="mb-3">
          <Form.Label className="fw-semibold">{field.label} :</Form.Label>
          <Form.Control
            type="text"
            value={field.value || ""}
            disabled
            readOnly
          />
        </Form.Group>
      );
    }

    if (field.type === "status") {
      return null;
    }

    return (
      <Form.Group key={index} className="mb-3">
        <Form.Label className="fw-semibold">{field.label} :</Form.Label>
        {field.type === "textarea" ? (
          <Form.Control
            as="textarea"
            rows={3}
            value={field.value || ""}
            onChange={(e) => field.onChange?.(e.target.value)}
            placeholder={field.placeholder}
          />
        ) : (
          <Form.Control
            type="text"
            value={field.value || ""}
            onChange={(e) => field.onChange?.(e.target.value)}
            placeholder={field.placeholder}
          />
        )}
      </Form.Group>
    );
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <div className="d-flex flex-column gap-4 mb-4">
      <Card>
        <Card.Header className="d-flex justify-content align-items-center gap-4">
          <Title level={2} content="Informations" />
          {isEditing && statusField && renderEditableFieldOnHeader(statusField)}
        </Card.Header>
        <Card.Body className="d-flex gap-2 flex-column">
          {isEditing ? (
            <Form>
              {fields.map((field, index) => renderEditableField(field, index))}
            </Form>
          ) : (
            fields.map((field, index) => renderReadOnlyField(field, index))
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default InformationSection;
