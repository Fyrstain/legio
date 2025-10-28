import { FunctionComponent } from "react";
import { ResearchStudy } from "fhir/r5";
import { useNavigate } from "react-router-dom";
import i18n from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";

interface Props {
  study: ResearchStudy;
}

/**
 * Extract normalized phase display information from a ResearchStudy.
 */
function getPhaseInfo(study: ResearchStudy) {
  const rawPhase =
    study.phase?.coding?.[0]?.display ??
    study.phase?.coding?.[0]?.code ??
    "";

  const normalized = rawPhase.toLowerCase().trim();

  switch (normalized) {
    case "post-cohorting":
      return {
        label: rawPhase,
        className:
          "instance-card-phase-badge instance-card-phase-post-cohorting",
      };
    case "post-datamart":
      return {
        label: rawPhase,
        className:
          "instance-card-phase-badge instance-card-phase-post-datamart",
      };
    default:
      return {
        label: rawPhase,
        className:
          "instance-card-phase-badge instance-card-phase-initial",
      };
  }
}

const InstanceCard: FunctionComponent<Props> = ({ study }) => {
  const navigate = useNavigate();

  const name = study.title ?? study.name ?? study.id ?? "—";
  const description = study.description ?? "";

  const { label: phaseLabel, className: phaseClassName } = getPhaseInfo(study);

  const openDetails = () => {
    if (study.id) {
      navigate(`/Study/${study.id}`);
    }
  };

  return (
    <div className="instance-card">
      <div className="instance-card-title-container">
        <h3 className="instance-card-title">{name}</h3>

        {phaseLabel && (
          <div className={phaseClassName}>{phaseLabel}</div>
        )}
      </div>

      <div className="instance-card-content">
        <p className="instance-card-description">{description}</p>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={openDetails}
        className="instance-card-button"
        //aria-label={i18n.t("button.seeInstance")}
        //title={i18n.t("button.seeInstance")}
      >
        <FontAwesomeIcon icon={faEye} />
        <span className="ms-2"></span>
        {i18n.t("button.seeInstance")}
      </Button>
    </div>
  );
};

export default InstanceCard;