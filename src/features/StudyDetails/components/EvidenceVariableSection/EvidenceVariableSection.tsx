// React
import { FunctionComponent, useMemo, useState } from "react";
// React Bootstrap
import { Accordion } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front library
import { Title } from "@fyrstain/hl7-front-library";
// Components
import ObsolescenceFilter from "../ObsolescenceFilter/ObsolescenceFilter";
// Types 
import { EvidenceVariableSectionProps } from "../../types/evidenceVariable.types";

////////////////////////////////
//           Props            //
////////////////////////////////

const EvidenceVariableSection: FunctionComponent<
  EvidenceVariableSectionProps
> = ({ evidenceVariables, type }) => {

  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  const [obsolescenceFilter, setObsolescenceFilter] = useState<
    "obsolete" | "not-obsolete" | "all"
  >("all");

  ////////////////////////////////
  //           Actions          //
  ////////////////////////////////

  /**
   * To determine if an evidence variable is obsolete based on its status.
   * @param status is the status of the evidence variable.
   * @returns a boolean indicating if the evidence variable is obsolete.
   */
  const isObsolete = (status?: string): boolean => {
    return status === "retired";
  };

  /**
   * To handle the change of the obsolescence filter.
   */
  const filteredEvidenceVariables = useMemo(() => {
    if (obsolescenceFilter === "all") {
      return evidenceVariables;
    }
    return evidenceVariables.filter((ev) => {
      const obsolete = isObsolete(ev.status);
      return obsolescenceFilter === "obsolete" ? obsolete : !obsolete;
    });
  }, [evidenceVariables, obsolescenceFilter]);

  /**
   * To handle the change of the obsolescence filter.
   * This function updates the state of the obsolescence filter based on the user's selection.
   * @param value is the new value of the obsolescence filter.
   */
  const handleObsolescenceFilterChange = (
    value: "obsolete" | "not-obsolete" | "all"
  ) => {
    setObsolescenceFilter(value);
  };

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
          <ObsolescenceFilter
            value={obsolescenceFilter}
            onChange={handleObsolescenceFilterChange}
          />
        </Accordion.Header>
        <Accordion.Body>
          {filteredEvidenceVariables.length > 0 ? (
            filteredEvidenceVariables.map((item, index) => (
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
                obsolescenceFilter === "obsolete"
                  ? i18n.t("errormessage.noobsoletevariables")
                  : obsolescenceFilter === "not-obsolete"
                  ? i18n.t("errormessage.nonotobsoletevariables")
                  :
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
