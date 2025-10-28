import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Client from "fhir-kit-client";
import { ResearchStudy, Bundle } from "fhir/r5";
import LegioPage from "../../../shared/components/LegioPage/LegioPage";
import InstanceCard from "../components/InstanceCard";
import AddInstanceCard from "../components/AddInstanceCard";
import { instantiateStudy } from "../services/studyDefinition.service";
import i18n from "i18next";

const definitionCache: Record<string, ResearchStudy> = {};
const instancesCache: Record<string, ResearchStudy[]> = {};

/**
 * Return the normalized (lowercased) phase of a ResearchStudy,
 */
function getPhaseCode(study: ResearchStudy | null | undefined): string {
  if (!study) return "";
  const raw =
    study?.phase?.coding?.[0]?.code ??
    study?.phase?.coding?.[0]?.display ??
    "";
  return raw.toLowerCase().trim();
}

/**
 * Return the CSS class for the phase badge (shown in the page header).
 */
function getPhaseBadgeClass(phase: string): string {
  switch (phase) {
    case "template":
      return "instance-card-phase-badge instance-card-phase-default";
    case "initial":
      return "instance-card-phase-badge instance-card-phase-initial";
    case "post-cohorting":
      return "instance-card-phase-badge instance-card-phase-post-cohorting";
    case "post-datamart":
      return "instance-card-phase-badge instance-card-phase-post-datamart";
    default:
      return "instance-card-phase-badge instance-card-phase-default";
  }
}

/**
 * Compute the canonical identifier used by the custom `definition` SearchParameter..
 */
function getDefinitionCanonical(
  defStudy: ResearchStudy | null
): string | null {
  if (!defStudy) return null;

  if (defStudy.url && defStudy.url.trim() !== "") {
    return defStudy.url.trim();
  }

  const ident =
    defStudy.identifier && defStudy.identifier.length > 0
      ? defStudy.identifier[0].value
      : undefined;

  if (ident && ident.trim() !== "") {
    return ident.trim();
  }

  return null;
}

const StudyDefinitionInstances: React.FC = () => {
  const { definitionId } = useParams<{ definitionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const [definitionStudy, setDefinitionStudy] = useState<ResearchStudy | null>(
    null
  );

  const [instances, setInstances] = useState<ResearchStudy[]>([]);

  const [phaseFilter, setPhaseFilter] = useState<string>("");

  const fhirClient = new Client({
    baseUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
  });

  const onError = useCallback(() => {
      navigate("/Error");
    }, [navigate]);

  useEffect(() => {
    if (!definitionId) return;

    if (
      definitionCache[definitionId] &&
      instancesCache[definitionId]
    ) {
      setDefinitionStudy(definitionCache[definitionId]);
      setInstances(instancesCache[definitionId]);
      setLoading(false);
      return;
    }

    loadData(definitionId);
  }, [definitionId]);

  /**
   * Fetch the study definition (template) and then
   * fetch all its related instances using the custom `definition` search parameter.
   */
  async function loadData(currentDefId: string) {
    setLoading(true);

    try {
      const defStudy = (await fhirClient.read({
        resourceType: "ResearchStudy",
        id: currentDefId,
      })) as ResearchStudy;
      const defCanonical = getDefinitionCanonical(defStudy);

      let fetchedInstances: ResearchStudy[] = [];

      if (defCanonical) {
        const bundle = (await fhirClient.search({
          resourceType: "ResearchStudy",
          searchParams: {
            definition: defCanonical,
            _sort: "-_lastUpdated",
          },
        })) as Bundle;

        const entries = bundle.entry ?? [];
        fetchedInstances = entries
          .map((e) => e.resource as ResearchStudy)
          .filter(Boolean)
          .filter((rs) => getPhaseCode(rs) !== "template");
      } else {
        fetchedInstances = [];
      }

      setDefinitionStudy(defStudy);
      setInstances(fetchedInstances);

      definitionCache[currentDefId] = defStudy;
      instancesCache[currentDefId] = fetchedInstances;
    } catch (err) {
      console.error(i18n.t("errormessage.loadingresearchstudyinstances"), err);
      onError();
    }

    setLoading(false);
  }

  /**
   * Client-side filtering by phase.
   */
  const filteredInstances = useMemo(() => {
    if (!phaseFilter) return instances;
    return instances.filter((rs) => getPhaseCode(rs) === phaseFilter);
  }, [instances, phaseFilter]);

  /**
   * Header metadata displayed at the top of the page.
   */
  const defTitle =
    definitionStudy?.title ??
    definitionStudy?.name ??
    definitionStudy?.id ??
    "Study";

  const defPhase = getPhaseCode(definitionStudy);
  const defDescription = definitionStudy?.description ?? "";

  const defPhaseClass = getPhaseBadgeClass(defPhase);

  /**
   * handleAddInstance:
   * - Calls $instantiate-study via the service layer
   * - Inserts the newly created instance at the top of the current list
   * - Updates the cache
   * - Navigates to /Study/{newInstanceId}
   */
  async function handleAddInstance() {
    if (!definitionStudy) return;

    try {
      const newInstance: ResearchStudy | null = await instantiateStudy(
        definitionStudy
      );

      if (!newInstance?.id) {
        console.error(
          i18n.t("errormessage.noResearchInstanceReturned")
        );
        onError();
        return;
      }

      setInstances((prev) => {
        const updated = [newInstance, ...prev];
        if (definitionId) {
          instancesCache[definitionId] = updated;
        }
        return updated;
      });

      navigate(`/Study/${newInstance.id}`);
    } catch (err) {
      console.error(i18n.t("errorDuringInstantiation"), err);
      onError();
    }
  }

  return (
    <LegioPage loading={loading} titleKey={defTitle}>
      <section className="instances-section">
        <div className="instances-header">
          <div className="instances-header-top">
            <div className="instances-header-left">
              <div className="instances-header-title-row">
                <h2 className="instances-page-title instances-page-title-no-margin">
                  {defTitle}
                </h2>

                {defPhase && (
                  <span className={defPhaseClass}>{defPhase}</span>
                )}
              </div>

              {defDescription && (
                <p className="instances-definition-desc-text">
                  {defDescription}
                </p>
              )}
            </div>
          </div>

          {/* ===== FILTERS ROW ===== */}
          <div className="instances-filters-row instances-filters-row-marginTop">
            <div className="filter-group">
              <label htmlFor="phaseFilter" className="filter-label">
                Phase
              </label>
              <select
                id="phaseFilter"
                className="filter-select"
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
              >
                <option value="">{i18n.t("placeholder.allPhases")}</option>
                <option value="initial">Initial</option>
                <option value="post-cohorting">Post-cohorting</option>
                <option value="post-datamart">Post-datamart</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===== GRID OF INSTANCES ===== */}
        <div className="instances-grid">
          {filteredInstances.map((study) => (
            <InstanceCard key={study.id ?? Math.random()} study={study} />
          ))}

          {/* "+" dashed card to create a new instance */}
          <AddInstanceCard onAdd={handleAddInstance} />
        </div>
      </section>
    </LegioPage>
  );
};

export default StudyDefinitionInstances;