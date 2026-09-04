import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResearchStudy } from "fhir/r5";
import i18n from "i18next";
import { getErrorDetails } from "@fyrstain/hl7-front-library";
import LegioPage from "../../../shared/components/LegioPage/LegioPage";
import InstanceCard from "../components/InstanceCard";
import AddInstanceCard from "../components/AddInstanceCard";
import {
  instantiateStudy,
  loadStudyDefinition,
  loadStudyInstances,
} from "../services/studyDefinition.service";

const definitionCache: Record<string, ResearchStudy> = {};
const instancesCache: Record<string, ResearchStudy[]> = {};

/////////////////////////////////////
//           Helpers               //
/////////////////////////////////////

function getPhaseCode(
  study: ResearchStudy | null | undefined
): string {
  if (!study) {
    return "";
  }

  return (
    study.phase?.coding?.[0]?.code ??
    ""
  )
    .toLowerCase()
    .trim();
}

/////////////////////////////////////
//           Component             //
/////////////////////////////////////

const StudyDefinitionInstances: React.FC = () => {
  const { definitionId } = useParams<{
    definitionId: string;
  }>();

  const navigate = useNavigate();

  /////////////////////////////////////
  //             State               //
  /////////////////////////////////////

  const [loading, setLoading] = useState(false);

  const [definitionStudy, setDefinitionStudy] =
    useState<ResearchStudy | null>(null);

  const [instances, setInstances] =
    useState<ResearchStudy[]>([]);

  const [phaseFilter, setPhaseFilter] =
    useState("");

  /////////////////////////////////////
  //             Error               //
  /////////////////////////////////////

  const onError = useCallback(
    (error?: unknown) => {
      navigate("/Error", {
        state: {
          error: getErrorDetails(error),
        },
      });
    },
    [navigate]
  );

  /////////////////////////////////////
  //          Data loading           //
  /////////////////////////////////////

  const loadData = useCallback(
    async (currentDefinitionId: string) => {
      setLoading(true);

      try {
        const definition =
          await loadStudyDefinition(
            currentDefinitionId
          );

        const fetchedInstances =
          await loadStudyInstances(definition);

        setDefinitionStudy(definition);
        setInstances(fetchedInstances);

        definitionCache[currentDefinitionId] =
          definition;

        instancesCache[currentDefinitionId] =
          fetchedInstances;
      } catch (error) {
        console.error(
          i18n.t(
            "errormessage.loadingresearchstudyinstances"
          ),
          error
        );

        onError(error);
      } finally {
        setLoading(false);
      }
    },
    [onError]
  );

  useEffect(() => {
    if (!definitionId) {
      return;
    }

    const cachedDefinition =
      definitionCache[definitionId];

    const cachedInstances =
      instancesCache[definitionId];

    if (
      cachedDefinition &&
      cachedInstances
    ) {
      setDefinitionStudy(cachedDefinition);
      setInstances(cachedInstances);

      return;
    }

    loadData(definitionId);
  }, [definitionId, loadData]);

  /////////////////////////////////////
  //           Filtering             //
  /////////////////////////////////////

  const filteredInstances = useMemo(() => {
    if (!phaseFilter) {
      return instances;
    }

    return instances.filter(
      (study) =>
        getPhaseCode(study) === phaseFilter
    );
  }, [instances, phaseFilter]);

  /////////////////////////////////////
  //          Definition             //
  /////////////////////////////////////

  const definitionPhase =
    getPhaseCode(definitionStudy);

  const isTemplate =
    definitionPhase === "template";

  const definitionTitle =
    definitionStudy?.title ??
    definitionStudy?.name ??
    definitionStudy?.id ??
    "Study";

  const definitionDescription =
    definitionStudy?.description ?? "";

  /////////////////////////////////////
  //        Instantiation            //
  /////////////////////////////////////

  const handleAddInstance =
    useCallback(async () => {
      if (!definitionStudy) {
        return;
      }

      if (!isTemplate) {
        console.warn(
          "Cannot instantiate a ResearchStudy that is not a template."
        );

        return;
      }

      setLoading(true);

      try {
        const newInstance =
          await instantiateStudy(
            definitionStudy
          );

        if (!newInstance?.id) {
          throw new Error(
            i18n.t(
              "errormessage.noResearchInstanceReturned"
            )
          );
        }

        setInstances((previous) => {
          const updated = [
            newInstance,
            ...previous,
          ];

          if (definitionId) {
            instancesCache[definitionId] =
              updated;
          }

          return updated;
        });

        navigate(
          `/Study/${newInstance.id}`
        );
      } catch (error) {
        console.error(
          i18n.t("errorDuringInstantiation"),
          error
        );

        onError(error);
      } finally {
        setLoading(false);
      }
    }, [
      definitionId,
      definitionStudy,
      isTemplate,
      navigate,
      onError,
    ]);

  /////////////////////////////////////
  //             Render              //
  /////////////////////////////////////

  return (
    <LegioPage
      loading={loading}
      titleKey={definitionTitle}
    >
      <section className="instances-section">
        <div className="instances-header">
          <div className="instances-header-top">
            <div className="instances-header-left">
              {definitionDescription && (
                <p className="instances-definition-desc-text">
                  {definitionDescription}
                </p>
              )}

              <p>
                <strong>Phase:</strong>{" "}
                {definitionPhase || "-"}
              </p>
            </div>
          </div>

          <div className="instances-filters-row instances-filters-row-marginTop">
            <div className="filter-group">
              <label
                htmlFor="phaseFilter"
                className="filter-label"
              >
                Phase
              </label>

              <select
                id="phaseFilter"
                className="filter-select"
                value={phaseFilter}
                onChange={(event) =>
                  setPhaseFilter(
                    event.target.value
                  )
                }
              >
                <option value="">
                  {i18n.t(
                    "placeholder.allPhases"
                  )}
                </option>

                <option value="initial">
                  Initial
                </option>

                <option value="post-cohorting">
                  Post-cohorting
                </option>

                <option value="post-datamart">
                  Post-datamart
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="instances-grid">
          {filteredInstances.map(
            (study) => (
              <InstanceCard
                key={study.id}
                study={study}
              />
            )
          )}

          {isTemplate && (
            <AddInstanceCard
              onAdd={
                handleAddInstance
              }
            />
          )}
        </div>

        {!isTemplate && (
          <div
            className="alert alert-info mt-3"
            role="alert"
          >
            This ResearchStudy is not a
            study definition template.
            Instantiation is therefore
            unavailable.
          </div>
        )}
      </section>
    </LegioPage>
  );
};

export default StudyDefinitionInstances;