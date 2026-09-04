// Font awesome
import { faEye } from "@fortawesome/free-solid-svg-icons";
// Fhir front library
import {
  SearchableTable,
  getErrorDetails,
} from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";
// React
import { FunctionComponent, useCallback } from "react";
// Navigation
import { useNavigate } from "react-router-dom";
// Components
import LegioPage from "../../../shared/components/LegioPage/LegioPage";

const Studies: FunctionComponent = () => {
  //////////////////////////////
  //        Navigation        //
  //////////////////////////////

  const navigate = useNavigate();

  const onDetails = useCallback(
    (id: string, phase?: string) => {
      if (phase === "template") {
        navigate(`/Studies/${id}`);
      } else {
        navigate(`/Study/${id}`);
      }
    },
    [navigate]
  );

  //////////////////////////////
  //           Error          //
  //////////////////////////////

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

  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <LegioPage titleKey={i18n.t("title.studies")}>
      <SearchableTable
        searchCriteriaProperties={{
          title: i18n.t("title.searchcriteria"),
          submitButtonLabel: i18n.t("button.search"),
          resetButtonLabel: i18n.t("button.reset"),
          language: i18n.t,

          /*
           * For now we display all ResearchStudy resources.
           *
           * The current integration environment contains study instances
           * (initial / post-cohorting / ...) but no study definition with
           * phase=template.
           *
           * The template-only filter can be restored once definitions are
           * available again on the target FHIR server.
           */
          fixedParameters: {
            _elements: "id,title,name,phase,status",
            _sort: "-_lastUpdated",
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
              width: "45%",
            },
            {
              header: "Phase",
              dataField: "phase",
              width: "20%",
            },
          ],

          action: [
            {
              icon: faEye,
              onClick: onDetails,
            },
          ],

          mapResourceToData: (resource: any) => ({
            id: resource.id,
            name: resource.title ?? resource.name ?? "-",
            phase:
              resource.phase?.coding?.[0]?.code ??
              resource.phase?.text ??
              "-",
          }),

          searchProperties: {
            serverUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
            resourceType: "ResearchStudy",
          },

          onError,
        }}
      />
    </LegioPage>
  );
};

export default Studies;