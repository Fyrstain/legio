// Font awesome
import { faEye } from "@fortawesome/free-solid-svg-icons";
// Fhir front library
import { SearchableTable } from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";
// React
import { FunctionComponent, useCallback } from "react";
// Navigation
import { useNavigate } from "react-router-dom";
// Components
import LegioPage from "../../components/LegioPage/LegioPage";

const Studies: FunctionComponent = () => {

  //////////////////////////////
  //        Navigation        //
  //////////////////////////////

  const navigate = useNavigate();

  //   const onDetails = useCallback(
  //     (id: string) => {
  //       navigate("/Study/" + id);
  //     },
  //     [navigate]
  //   );

  // TODO Replace by onDetails when we'll need the Study Detail Page
  const viewInProgress = useCallback(() => {
    navigate("/InProgress");
  }, [navigate]);

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <LegioPage titleKey="Studies">
      <SearchableTable
        searchCriteriaProperties={{
          title: i18n.t("title.searchcriteria"),
          submitButtonLabel: i18n.t("button.search"),
          resetButtonLabel: i18n.t("button.reset"),
          language: i18n.t,
          fixedParameters: {
            _elements: "id,title,phase",
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
            {
              label: "Phase",
              type: "select",
              placeholder: i18n.t("defaultvalue.phase"),
              options: [
                { value: "n-a", label: "N/A" },
                { value: "early-phase-1", label: "Early Phase 1" },
                { value: "phase-1", label: "Phase 1" },
                { value: "phase-1-phase-2", label: "Phase 1 - Phase 2" },
                { value: "phase-2", label: "Phase 2" },
                { value: "phase-2-phase-3", label: "Phase 2 - Phase 3" },
                { value: "phase-3", label: "Phase 3" },
                { value: "phase-4", label: "Phase 4" },
              ],
              searchParamsName: "phase",
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
              dataField: "Name",
              width: "40%",
            },
            {
              header: "Phase",
              dataField: "Phase",
              width: "25%",
            },
          ],
          action: [
            {
              icon: faEye,
              onClick: viewInProgress,
            },
          ],
          mapResourceToData: (resource: any) => {
            return {
              id: resource.id,
              Name: resource.title,
              Phase: resource.phase.coding[0].display,
            };
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
