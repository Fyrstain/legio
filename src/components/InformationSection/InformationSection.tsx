// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Card, Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front library
import { FhirStatus, StatusTag, Title } from "@fyrstain/hl7-front-library";

////////////////////////////////
//           Props            //
////////////////////////////////

export interface InformationSectionProps {
  fields: {
    label: string;
    value: any;
    type?: "status";
  }[];
}

const InformationSection: FunctionComponent<InformationSectionProps> = ({
  fields,
}) => {
    
  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <div className="d-flex flex-column gap-4 mb-4">
      <Card>
        <Card.Header>
          <Title level={2} content="Informations" />
        </Card.Header>
        <Card.Body className="d-flex flex-column gap-2">
          {fields.map((field, index) => (
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
                  <Form.Label className="fw-bold mb-0">
                    {i18n.t("label.status")} :
                  </Form.Label>
                  <Form.Text className="mt-0">
                    <StatusTag
                      flavor={
                        FhirStatus[field.value as keyof typeof FhirStatus]
                      }
                      message={field.value}
                    />
                  </Form.Text>
                </div>
              )}
            </div>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
};

export default InformationSection;
