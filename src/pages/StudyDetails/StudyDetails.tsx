// React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import LegioPage from "../../components/LegioPage/LegioPage";
import InformationSection from "../../components/InformationSection/InformationSection";
import StudyService from "../../services/StudyService";
import EvidenceVariableSection from "../../components/EvidenceVariableSection/EvidenceVariableSection";
// Resources
import { Bundle, EvidenceVariable, List, ResearchStudy } from "fhir/r5";
// Translation
import i18n from "i18next";
// React
import { Button } from "react-bootstrap";
// HL7 Front Library
import { PaginatedTable, Title } from "@fyrstain/hl7-front-library";

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

  // Parameters array
  const [datamartParameterNames, setDatamartParameterNames] = useState<
    string[]
  >([]);

  // Cohorting and datamart generation result
  const [datamartResult, setDatamartResult] = useState<List | undefined>();

  // Existing datamart list ID, used to check if a datamart already exists for the study
  const [isExistingDatamartListId, setIsExistingDatamartListId] =
    useState<boolean>(false);

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
   * Load the datamart for a study if it exists
   *
   * @param study The ResearchStudy resource
   * @returns a promise with the datamart list or null if it doesn't exist
   */
  async function loadDatamartForStudy(study: ResearchStudy): Promise<void> {
    // Find the datamart extension
    const datamartExtension = study.extension?.find(
      (extension) =>
        extension.url ===
        "https://www.centreantoinelacassagne.org/StructureDefinition/EXT-Datamart"
    );
    // Check if the datamart extension exists and has a valueReference
    if (datamartExtension) {
      const evaluationExt = datamartExtension.extension?.find(
        (ext) => ext.url === "evaluation"
      );
      if (evaluationExt?.valueReference?.reference) {
        // Extract the ID
        const reference = evaluationExt.valueReference.reference;
        const listId = reference.includes("/")
          ? reference.split("/")[1]
          : reference;
        setIsExistingDatamartListId(true);
        try {
          // Load the list using the ID
          const list = await StudyService.loadListById(listId);
          setDatamartResult(list);
        } catch (error) {
          onError();
        }
      } else {
        setIsExistingDatamartListId(false);
      }
    } else {
      setIsExistingDatamartListId(false);
    }
  }

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
      // Load the datamart for the study
      loadDatamartForStudy(study);
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

  /**
   * Handle the cohorting and datamart generation.
   * This function is called when the user clicks on the "Generate" button.
   */
  const handleCohortingAndDatamart = async () => {
    setLoading(true);
    try {
      const response = await StudyService.generateCohortAndDatamart(
        studyId ?? ""
      );
      setDatamartResult(response.datamartResult);
      setIsExistingDatamartListId(true);
    } catch (error) {
      onError();
    } finally {
      setLoading(false);
    }
  };

  /**
   * A function to get the value of a parameter.
   *
   * @param param The parameter to get the value from
   * @returns The value of the parameter as a string
   */
  function getParameterValue(param: any): string {
    if (!param) return "N/A";
    if (param.valueBoolean !== undefined) return param.valueBoolean.toString();
    if (param.valueString) return param.valueString;
    if (param.valueInteger !== undefined) return param.valueInteger.toString();
    if (param.valueDecimal !== undefined) return param.valueDecimal.toString();
    return "N/A";
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
        <div className="d-flex justify-content-end mt-3">
          <Button
            variant="primary"
            onClick={handleCohortingAndDatamart}
            disabled={isExistingDatamartListId}
          >
            {i18n.t("button.generate")}
          </Button>
        </div>

        {datamartResult && (
          <div className="mt-4">
            {/* {datamartParameterNames.length > 0 ? ( */}
            <>
              <Title
                level={3}
                content={i18n.t("label.generateddatamart")}
              ></Title>
              <PaginatedTable
                columns={[
                  {
                    header: "Patient",
                    dataField: "subjectId",
                    width: "30%",
                  },
                  ...datamartParameterNames.map((param) => ({
                    header: param.toUpperCase(),
                    dataField: param,
                    width: "25%",
                  })),
                ]}
                mapResourceToData={(resource: any) => {
                  const data: any = {};
                  // Extract Patient reference
                  const subjectParam = resource.parameter.find(
                    (parameter: {
                      name: string;
                      valueReference?: { reference: string };
                    }) => parameter.name === "Patient"
                  );
                  data.subjectId =
                    subjectParam?.valueReference?.reference ?? "N/A";
                  // Extract all other parameters
                  resource.parameter.forEach((param: any) => {
                    if (param.name !== "Patient") {
                      data[param.name] = getParameterValue(param);
                    }
                  });
                  return data;
                }}
                searchProperties={{
                  serverUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
                  resourceType: "Parameters",
                  searchParameters: {
                    "_has:List:item:_id": datamartResult.id ?? "",
                  },
                }}
                onError={onError}
              />
            </>
            {/* ) : (
              <Title
                level={4}
                content={i18n.t("errormessage.nogenerateddatamart")}
              ></Title>
            )} */}
          </div>
        )}
      </>
    </LegioPage>
  );
};

export default StudyDetails;
