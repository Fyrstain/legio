// Font awesome
import { faEye } from "@fortawesome/free-solid-svg-icons";
// Fhir front library
import {
  SearchableTable,
  ValueSetLoader,
  getErrorDetails,
} from "@fyrstain/hl7-front-library";
// Fhir
import Client from "fhir-kit-client";
// Translation
import i18n from "i18next";
// React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
// Navigation
import { useNavigate } from "react-router-dom";
// Components
import LegioPage from "../../../shared/components/LegioPage/LegioPage";

const Studies: FunctionComponent = () => {

  /////////////////////////////////////
  //            Constants            //
  /////////////////////////////////////

  const researchStudyPhaseUrl =
    process.env.REACT_APP_VALUESET_RESEARCHSTUDYPHASES_URL ??
    "https://www.isis.com/ValueSet/VS-ResearchStudyPhase";

  /////////////////////////////////////
  //             State               //
  /////////////////////////////////////

  /////////////////////////////////////
  //             Client              //
  /////////////////////////////////////

  //////////////////////////////
  //        Navigation        //
  //////////////////////////////

  const navigate = useNavigate();

  const onDetails = useCallback(
    (id: string) => {
      // Navigate to the intermediate page showing definition metadata and instances
      navigate(`/Studies/${id}`);
    },
    [navigate]
  );

  /////////////////////////////////////
  //          Page Loading           //
  /////////////////////////////////////

  const [loading, setLoading] = useState(false);
  const [filtersUnavailable, setFiltersUnavailable] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      try {
        const fhirClient = new Client({
          baseUrl: process.env.REACT_APP_TERMINOLOGY_URL ?? "fhir",
        });
        const valueSetLoader = new ValueSetLoader(fhirClient);
        await valueSetLoader.searchValueSet(researchStudyPhaseUrl);
      } catch {
        // The phase ValueSet is used by an optional search filter.
        setFiltersUnavailable(true);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [researchStudyPhaseUrl]);

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  /**
   * Redirect to the error page.
   */
  const onError = useCallback((error?: unknown) => {
    navigate("/Error", { state: { error: getErrorDetails(error) } });
  }, [navigate]);

  //////////////////////////////
  //          Content         //
  //////////////////////////////

    return (
    <LegioPage loading={loading} titleKey={i18n.t("title.studies")}> 
      <>
        {filtersUnavailable && <div className="alert alert-warning" role="alert">{i18n.t("status.filtersUnavailable", { defaultValue: "Some search filters are currently unavailable." })}</div>}
        {/*Display only ResearchStudy definitions (phase code '#template').*/}
        <SearchableTable
            searchCriteriaProperties={{
            title: i18n.t("title.searchcriteria"),
            submitButtonLabel: i18n.t("button.search"),
            resetButtonLabel: i18n.t("button.reset"),
            language: i18n.t,
            fixedParameters: {
                _elements: "id,title",
                _sort: "-_lastUpdated",
                phase: "template",
            },
            inputs: [
                {
                label: "ID",
                type: "text",
                searchParamsName: "_id",
                },
                {
                label: i18n.t("label.name"),
                type: "text",
                searchParamsName: "title:contains",
                },
            ],
            }}
            paginatedTableProperties={{
            columns: [
                {
                header: "ID",
                dataField: "id",
                width: "25%",
                },
                {
                header: i18n.t("label.name"),
                dataField: "name",
                width: "66%",
                },
            ],
            action: [
                {
                    icon: faEye,
                    onClick: onDetails,
                },
            ],
            mapResourceToData: (resource: any) => {
                try {
                    return {
                    id: resource.id,
                    name: resource.title,
                    }
                } catch (error) {
                    console.error("Error mapping resource to data:", error);
                    onError(error); 
                }
            },
            searchProperties: {
                serverUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
                resourceType: "ResearchStudy",
            },
            onError: onError,
            }}
        />
      </>
    </LegioPage>
  );
};

export default Studies;
