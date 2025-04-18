// React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import LegioPage from "../../components/LegioPage/LegioPage";
import InformationSection from "../../components/InformationSection/InformationSection";
import StudyService from "../../services/StudyService";
import EvidenceVariableSection from "../../components/EvidenceVariableSection/EvidenceVariableSection";
// Resources
import { Bundle, EvidenceVariable, ResearchStudy } from "fhir/r5";
// Translation
import i18n from "i18next";

const StudyDetails: FunctionComponent = () => {

  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Study informations
  const { studyId } = useParams();
  const [studyDetails, setStudyDetails] = useState({
    name: "",
    title: "",
    status: "",
    description: "",
    nctId: "",
    localContact: "",
    studySponsorContact: "",
    phase: "",
    studyDesign: [] as string[],
  });

  // Inclusion criteria array
  const [inclusionCriteria, setInclusionCriteria] = useState<
    Array<{
      title: string;
      description: string;
    }>
  >([]);

  // Study variables array
  const [studyVariables, setStudyVariables] = useState<
    Array<{
      title: string;
      description: string;
    }>
  >([]);

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  /**
   * Navigate to the error page.
   */
  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  ////////////////////////////////
  //           Actions          //
  ////////////////////////////////

  useEffect(() => {
    loadStudy();
    loadEvidenceVariables("inclusion");
    loadEvidenceVariables("study");
  }, []);

  /**
   * Load Study from the back to populate the fields.
   *
   * @returns the promise of a Study.
   */
  async function loadStudy() {
    setLoading(true);
    try {
      const response = await StudyService.loadStudy(studyId ?? "");
      const study: ResearchStudy = response as ResearchStudy;
      // Find the local contact and study sponsor contact by the role code
      const localContact =
        study.associatedParty?.find(
          (party) => party.role?.coding?.[0]?.code === "general-contact"
        )?.name ?? "N/A";
      const studySponsorContact =
        study.associatedParty?.find(
          (party) => party.role?.coding?.[0]?.code === "sponsor"
        )?.name ?? "N/A";
      // The data to display
      const studyData = {
        name: study.name ?? "N/A",
        title: study.title ?? "N/A",
        status: study.status ?? "N/A",
        description: study.description ?? "N/A",
        nctId: study.identifier?.[0]?.value ?? "N/A",
        localContact: localContact,
        studySponsorContact: studySponsorContact,
        phase: study.phase?.coding?.[0]?.display ?? "N/A",
        studyDesign: study.studyDesign?.map(
          (design) => design.coding?.[0]?.display ?? "N/A"
        ) ?? ["N/A"],
      };
      setStudyDetails(studyData);
    } catch (error) {
      onError();
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load the Evidence variables from the back to populate the fields using the include and separate them by type. 
   */
  async function loadEvidenceVariables(type: "inclusion" | "study") {
    const serviceMethod =
      type === "inclusion"
        ? StudyService.loadInclusionCriteria
        : StudyService.loadStudyVariables;
    try {
      const response = await serviceMethod(studyId ?? "");
      const evidenceVariablesBundle = response as Bundle;
      const evidenceVariables =
        evidenceVariablesBundle.entry
          ?.filter((item) => item.resource?.resourceType === "EvidenceVariable")
          .map((item) => {
            const evidenceVariable = item.resource as EvidenceVariable;
            return {
              title: evidenceVariable.title ?? "N/A",
              description: evidenceVariable.description ?? "N/A",
            };
          }) ?? [];
      if (type === "inclusion") {
        setInclusionCriteria(evidenceVariables);
      } else {
        setStudyVariables(evidenceVariables);
      }
    } catch (error) {
      onError();
    }
  }

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <LegioPage titleKey="title.studydetails" loading={loading}>
      <>
        <InformationSection
          fields={[
            {
              label: "ID",
              value: studyId,
            },
            {
              label: i18n.t("label.name"),
              value: studyDetails.name,
            },
            {
              label: i18n.t("label.title"),
              value: studyDetails.title,
            },
            {
              label: i18n.t("label.status"),
              value: studyDetails.status,
              type: "status",
            },
            {
              label: i18n.t("label.generaldescription"),
              value: studyDetails.description,
            },
            {
              label: i18n.t("label.nctid"),
              value: studyDetails.nctId,
            },
            {
              label: i18n.t("label.localcontact"),
              value: studyDetails.localContact,
            },
            {
              label: i18n.t("label.studysponsorcontact"),
              value: studyDetails.studySponsorContact,
            },
            {
              label: "Phase",
              value: studyDetails.phase,
            },
            {
              label: i18n.t("label.studydesign"),
              value: (
                <ul>
                  {studyDetails.studyDesign.map((design, index) => (
                    <li key={index}>{design}</li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
        <EvidenceVariableSection
          evidenceVariables={inclusionCriteria}
          type="inclusion"
        />
        <EvidenceVariableSection
          evidenceVariables={studyVariables}
          type="study"
        />
      </>
    </LegioPage>
  );
};

export default StudyDetails;
