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
import EvidenceVariableButtons from "../../components/EvidenceVariableButtons/EvidenceVariableButtons";
import CharacteristicDisplay from "./CharacteristicDisplay";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
// Types
import {
  EvidenceVariableActionType,
  EvidenceVariableSectionProps,
} from "../../types/evidenceVariable.types";

const EvidenceVariableSection: FunctionComponent<
  EvidenceVariableSectionProps
> = ({
  evidenceVariables,
  evidenceVariableModels,
  type,
  editMode = false,
  onAction,
  onEditEV,
}) => {
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

  /**
   * To determine if the header should be displayed for this type.
   * The header is displayed if there is at least one evidence variable with characteristics.
   */
  const shouldDisplayHeader = filteredEvidenceVariables.some(
    (ev) => ev.hasCharacteristic
  );

  /**
   * To determine if the header for inclusion criteria should be displayed.
   */
  const inclusionCriteriaHeader = type === "inclusion" && shouldDisplayHeader;

  /**
   * To determine if the header for study variables should be displayed.
   */
  const studyVariablesHeader = type === "study" && shouldDisplayHeader;

  /**
   * To get the characteristics of an evidence variable.
   * @param index index of the evidence variable in the evidenceVariables array
   * @returns the characteristics of the evidence variable or an empty array if not found.
   */
  const getCharacteristics = (index: number) => {
    return evidenceVariableModels[index]?.getCharacteristics() || [];
  };

  /**
   * Handles an action for the root/header level.
   * @param actionType is the type of action to perform.
   */
  const handleHeaderAction = (actionType: EvidenceVariableActionType) => {
    onAction?.(actionType, []);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Accordion defaultActiveKey="0" className="mb-4">
      {/* if we have a header for inclusion criteria, we display it */}
      {inclusionCriteriaHeader || studyVariablesHeader ? (
        filteredEvidenceVariables.map((item, index) => (
          <Accordion.Item eventKey={String(index)} key={index}>
            <Accordion.Header>
              <div className="d-flex align-items-center gap-4">
                <Title
                  level={2}
                  content={`${
                    type === "inclusion"
                      ? i18n.t("title.inclusioncriteria")
                      : i18n.t("title.studyvariables")
                  } - ${item.title}`}
                />
                {editMode && (
                  <FontAwesomeIcon
                    className="actionIcon"
                    icon={faPen}
                    size="xl"
                    title={i18n.t("button.edittheevidencevariable")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEV?.(item.id || "");
                    }}
                  />
                )}
                {editMode && onAction && !item.hasCharacteristic && (
                  <EvidenceVariableButtons
                    buttonType="characteristic"
                    editMode={editMode}
                    onAction={onAction}
                    type={type}
                    hasExistingCombination={evidenceVariableModels[
                      index
                    ]?.hasDefinitionByCombination()}
                  />
                )}
                <ObsolescenceFilter
                  value={obsolescenceFilter}
                  onChange={handleObsolescenceFilterChange}
                />
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="d-flex gap-1">
                <div className="fw-bold">Description :</div>
                {item.description || "N/A"}
              </div>
              {item.hasCharacteristic && (
                <CharacteristicDisplay
                  characteristics={getCharacteristics(index)}
                  editMode={editMode}
                  onAction={onAction}
                  type={type}
                  hasExistingCombination={evidenceVariableModels[
                    index
                  ]?.hasDefinitionByCombination()}
                />
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))
      ) : (
        // If we have no inclusion criteria, we display a single accordion with the title and the obsolescence filter
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center gap-4">
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
              {editMode && onAction && evidenceVariables.length === 0 && (
                <EvidenceVariableButtons
                  buttonType={
                    type === "inclusion" ? "criteria" : "studyVariable"
                  }
                  editMode={editMode}
                  onAction={onAction}
                  type={type}
                />
              )}
            </div>
          </Accordion.Header>
          <Accordion.Body>
            {filteredEvidenceVariables.length > 0 ? (
              filteredEvidenceVariables.map((item, index) => (
                <div key={index} className="mb-3">
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        <Title level={3} content={item.title} />
                        <div className="d-flex align-items-center gap-4 ms-4">
                          {editMode && (
                            <FontAwesomeIcon
                              className="actionIcon"
                              icon={faPen}
                              size="xl"
                              title={i18n.t("button.edittheevidencevariable")}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEV?.(item.id || "");
                              }}
                            />
                          )}
                          {editMode && onAction && !item.hasCharacteristic && (
                            <EvidenceVariableButtons
                              buttonType="characteristic"
                              editMode={editMode}
                              onAction={handleHeaderAction}
                              type={type}
                            />
                          )}
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="d-flex gap-1">
                          <div className="fw-bold">Description :</div>
                          {item.description || "N/A"}
                        </div>
                        {item.hasCharacteristic && (
                          <CharacteristicDisplay
                            characteristics={getCharacteristics(index)}
                            editMode={editMode}
                            onAction={onAction}
                            type={type}
                            hasExistingCombination={evidenceVariableModels[
                              index
                            ]?.hasDefinitionByCombination()}
                          />
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              ))
            ) : (
              <Title
                level={3}
                content={
                  obsolescenceFilter === "obsolete"
                    ? i18n.t("errormessage.noobsoletevariables")
                    : obsolescenceFilter === "not-obsolete"
                    ? i18n.t("errormessage.nonotobsoletevariables")
                    : type === "inclusion"
                    ? i18n.t("errormessage.noinclusioncriteria")
                    : i18n.t("errormessage.nostudyvariables")
                }
              />
            )}
          </Accordion.Body>
        </Accordion.Item>
      )}
    </Accordion>
  );
};

export default EvidenceVariableSection;
