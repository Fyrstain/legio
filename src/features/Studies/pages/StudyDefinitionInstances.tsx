import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ResearchStudy } from "fhir/r5";
import i18n from "i18next";
// Services
import {
  loadStudyDefinition,
  loadStudyInstances,
  instantiateStudy,
} from "../services/studyDefinition.service";
// Components
import LegioPage from "../../../shared/components/LegioPage/LegioPage";
import InstanceCard from "../components/InstanceCard";
import AddInstanceCard from "../components/AddInstanceCard";
// Styles
import "./StudyDefinitionInstances.scss";

/**
 * Page displaying the metadata of a ResearchStudy definition and the list
 * of its instance studies.  Also renders a card to create a new instance.
 *
 * This page is intended to be navigated to from the Studies list when
 * clicking on the details of a definition (phase = template).  It
 * separates definitions from instances, ensuring that the user can
 * instantiate a definition or open existing instances.
 */
const StudyDefinitionInstances: FunctionComponent = () => {
  // Retrieve the definition id from the route
  const { definitionId } = useParams<{ definitionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [definition, setDefinition] = useState<ResearchStudy | null>(null);
  const [instances, setInstances] = useState<ResearchStudy[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load definition and instances on mount
  useEffect(() => {
    async function load() {
      if (!definitionId) {
        return;
      }
      setLoading(true);
      try {
        const def = await loadStudyDefinition(definitionId);
        setDefinition(def);
        const insts = await loadStudyInstances(def);
        setInstances(insts);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? "An unexpected error occurred.");
      }
      setLoading(false);
    }
    load();
  }, [definitionId]);

  // Handler for creating a new instance
  const handleAddInstance = useCallback(async () => {
    if (!definition) return;
    try {
      const created = await instantiateStudy(definition);
      if (created && created.id) {
        navigate(`/Study/${created.id}`);
      } else {
        // If instantiation is not implemented or fails, reload instances list
        const insts = await loadStudyInstances(definition);
        setInstances(insts);
      }
    } catch (err: any) {
      setError(err?.message ?? "Could not create instance.");
    }
  }, [definition, navigate]);

  const renderContent = () => {
    if (loading) {
      return <div>{i18n.t("message.loading") ?? "Loading..."}</div>;
    }
    if (error) {
      return <div className="text-danger">{error}</div>;
    }
    if (!definition) {
      return <div>{i18n.t("message.nostudy") ?? "Study not found."}</div>;
    }
    // Extract basic metadata from definition
    const title = definition.title ?? definition.name ?? definition.id;
    const description = definition.description ?? "";
    const phaseDisplay =
      definition.phase?.coding?.[0]?.display ??
      definition.phase?.coding?.[0]?.code ??
      "";
    return (
      <div>
        {/* Metadata section */}
        <div className="definition-meta">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
          {phaseDisplay && (
            <p>
              {i18n.t("label.phase") ?? "Phase"}: {phaseDisplay}
            </p>
          )}
        </div>
        {/* Instances grid */}
        {instances && instances.length > 0 ? (
          <div className="instances-grid">
            {instances.map((instance) => (
              <InstanceCard key={instance.id} study={instance} />
            ))}
            <AddInstanceCard onAdd={handleAddInstance} />
          </div>
        ) : (
          // No instances – show a single wide add card
          <AddInstanceCard onAdd={handleAddInstance} fullWidth={true} />
        )}
      </div>
    );
  };

  return (
    <LegioPage loading={loading} titleKey={"title.studydetails"}>
      {renderContent()}
    </LegioPage>
  );
};

export default StudyDefinitionInstances;