// Font awesome
import { faEye } from "@fortawesome/free-solid-svg-icons";
// Fhir front library
import { SearchableTable } from "@fyrstain/hl7-front-library";
// Fhir
import Client from "fhir-kit-client";
import { SimpleCode, ValueSetLoader } from "@fyrstain/hl7-front-library";
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
    "https://www.centreantoinelacassagne.org/ValueSet/VS-ResearchStudyPhase";

  /////////////////////////////////////
  //             State               //
  /////////////////////////////////////

  const [researchStudyPhases, setResearchStudyPhases] = useState(
    [] as SimpleCode[]
  );

  /////////////////////////////////////
  //             Client              //
  /////////////////////////////////////

  const fhirClient = new Client({
    baseUrl: process.env.REACT_APP_TERMINOLOGY_URL ?? "fhir",
  });

  const valueSetLoader = new ValueSetLoader(fhirClient);

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

  useEffect(() => {
    loadPage();
  }, []);

  /**
   * Load the initial state of the page.
   */
  async function loadPage() {
    setLoading(true);
    try {
      setResearchStudyPhases(
        await valueSetLoader.searchValueSet(researchStudyPhaseUrl)
      );
    } catch (error) {
      console.log(error);
      onError();
    }
    setLoading(false);
  }

  /////////////////////////////////////
  //             Actions             //
  /////////////////////////////////////

  /**
   * Get the option element to represent the code in an Input Select.
   * @param code the code.
   * @returns the option element.
   */
  function getOption(code: SimpleCode) {
    return { value: code.code, label: code.display ?? code.code };
  }

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  /**
   * Redirect to the error page.
   */
  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  //////////////////////////////
  //          Content         //
  //////////////////////////////

    return (
    <LegioPage loading={loading} titleKey={i18n.t("title.studies")}> 
        {/*
          * Display only ResearchStudy definitions (phase code '#template').
          * We remove the phase filter from the search criteria and force the search
          * to always include phase=template via fixedParameters.  Clicking on an
          * item navigates to the intermediate page where the definition's
          * instances are shown.
          */}
        <SearchableTable
            searchCriteriaProperties={{
            title: i18n.t("title.searchcriteria"),
            submitButtonLabel: i18n.t("button.search"),
            resetButtonLabel: i18n.t("button.reset"),
            language: i18n.t,
            // Always filter on phase code 'template' to show only study definitions
            fixedParameters: {
                _elements: "id,title,phase",
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
                // Intentionally omit the phase select input because study definitions
                // are filtered via the fixedParameters above.
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
                width: "50%",
                },
                {
                header: "Phase",
                dataField: "phase",
                width: "25%",
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
                    phase:
                        resource.phase?.coding?.[0]?.display ??
                        resource.phase?.coding?.[0]?.code,
                    };
                } catch (error) {
                    console.error("Error mapping resource to data:", error);
                    onError(); 
                }
            },
            searchProperties: {
                serverUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
                resourceType: "ResearchStudy",
            },
            onError: onError,
            }}
        />
    </LegioPage>
  );
};

export default Studies;
