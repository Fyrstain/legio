// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Accordion } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front library
import { Title } from "@fyrstain/hl7-front-library";

////////////////////////////////
//         Interface          //
////////////////////////////////

interface EvidenceVariable {
  title: string;
  description: string;
}

////////////////////////////////
//           Props            //
////////////////////////////////

export interface EvidenceVariableSectionProps {
  evidenceVariables: EvidenceVariable[];
  type: "inclusion" | "study";
}

const EvidenceVariableSection: FunctionComponent<
  EvidenceVariableSectionProps
> = ({ evidenceVariables, type }) => {
  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Accordion defaultActiveKey="0" className="mb-4">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <Title
            level={2}
            content={
              type === "inclusion"
                ? i18n.t("title.inclusioncriteria")
                : i18n.t("title.studyvariables")
            }
          />
        </Accordion.Header>
        <Accordion.Body>
          {evidenceVariables.length > 0 ? (
            evidenceVariables.map((item, index) => (
              <Accordion key={index} defaultActiveKey="0" className="mt-3">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <Title level={3} content={item.title} />
                  </Accordion.Header>
                  <Accordion.Body>{item.description}</Accordion.Body>
                </Accordion.Item>
              </Accordion>
            ))
          ) : (
            <Title
              level={3}
              content={
                type === "inclusion"
                  ? i18n.t("errormessage.noinclusioncriteria")
                  : i18n.t("errormessage.nostudyvariables")
              }
            />
          )}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default EvidenceVariableSection;
