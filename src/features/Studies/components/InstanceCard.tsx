import { FunctionComponent } from "react";
import { ResearchStudy } from "fhir/r5";
import { useNavigate } from "react-router-dom";
import i18n from "i18next";
// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

/**
 * Card representing a single study instance.
 * Displays the name, a short description, the phase and a button to open the
 * detailed view.  Styling adheres to the design system via CSS variables.
 */
interface Props {
  study: ResearchStudy;
}

const InstanceCard: FunctionComponent<Props> = ({ study }) => {
  const navigate = useNavigate();
  const name = study.title ?? study.name ?? study.id;
  const description = study.description ?? "";
  const phaseDisplay =
    study.phase?.coding?.[0]?.display ?? study.phase?.coding?.[0]?.code ?? "";

  const openDetails = () => {
    if (study.id) {
      navigate(`/Study/${study.id}`);
    }
  };

  return (
    <div className="instance-card">
      <div className="instance-card-content">
        <h3 className="instance-card-title">{name}</h3>
        {description && (
          <p className="instance-card-description">
            {description}
          </p>
        )}
        {phaseDisplay && (
          <p className="instance-card-phase">
            {i18n.t("label.phase")}: {phaseDisplay}
          </p>
        )}
      </div>
      <button
        className="instance-card-button"
        onClick={openDetails}
        aria-label="See instance"
      >
        {/* Show an eye icon to indicate viewing the instance */}
        <FontAwesomeIcon icon={faEye} style={{ marginRight: '0.5rem' }} />
        <span>See instance</span>
      </button>
    </div>
  );
};

export default InstanceCard;