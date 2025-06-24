// React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import LegioPage from "../../components/LegioPage/LegioPage";
import InformationSection from "../../components/InformationSection/InformationSection";
import EvidenceVariableSection from "../../components/EvidenceVariableSection/EvidenceVariableSection";
// Services
import StudyService from "../../services/StudyService";
// Resources
import { List, ResearchStudy } from "fhir/r5";
// Translation
import i18n from "i18next";
// React
import { Alert, Button } from "react-bootstrap";
// HL7 Front Library
import { PaginatedTable, Title } from "@fyrstain/hl7-front-library";
// Buffer
import { Buffer } from "buffer";
// Font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faPen,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";

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
    version: "",
    nctId: "",
    localContact: "",
    studySponsorContact: "",
    phase: "",
    studyDesign: [] as string[],
  });

  // State to manage editing mode
  const [isEditingForm, setIsEditingForm] = useState(false);

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
      expression?: string;
    }>
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
  //          Lifecyle          //
  ////////////////////////////////

  useEffect(() => {
    loadStudy();
    loadEvidenceVariablesHandler("inclusion");
    loadEvidenceVariablesHandler("study");
  }, []);

  ////////////////////////////////
  //           Actions          //
  ////////////////////////////////

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
      loadDatamartForStudyHandler(study);
      // The data to display
      const studyData = {
        name: study.name ?? "N/A",
        title: study.title ?? "N/A",
        status: study.status ?? "N/A",
        description: study.description ?? "N/A",
        version: study.version ?? "N/A",
        nctId: study.identifier?.[0]?.value ?? "N/A",
        localContact: localContact,
        studySponsorContact: studySponsorContact,
        phase: study.phase?.coding?.[0]?.display ?? study.phase?.coding?.[0]?.code ?? "N/A",
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
   * Update the ResearchStudy resource with the new values.
   *
   * @param updatedValues The new values to update
   */
  const handleSave = async () => {
    setLoading(true);
    try {
      console.log("Données à sauvegarder:", studyDetails);
      // Update the ResearchStudy resource with the new values
      await StudyService.updateStudy(studyId ?? "", studyDetails);
      // Exit the editing mode
      setIsEditingForm(false);
      // Success message
      // TODO : use a badge or a toast instead of an alert
      alert("Étude mise à jour avec succès!");
    } catch (error) {
      // TODO : use a badge / toast instead of an alert
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load the datamart for a study if it exists
   *
   * @param study The ResearchStudy resource
   */
  async function loadDatamartForStudyHandler(study: ResearchStudy) {
    try {
      const datamartList = await StudyService.loadDatamartForStudy(study);
      if (datamartList) {
        setDatamartResult(datamartList);
        setIsExistingDatamartListId(true);
      } else {
        setIsExistingDatamartListId(false);
      }
    } catch (error) {
      onError();
    }
  }

  /**
   * Function to load evidence variables (inclusion criteria or study variables) from the backend.
   *
   * @param type The type of evidence variable to load (inclusion or study)
   */
  async function loadEvidenceVariablesHandler(type: "inclusion" | "study") {
    try {
      const evidencesVariables = await StudyService.loadEvidenceVariables(
        studyId ?? "",
        type
      );
      if (type === "inclusion") {
        setInclusionCriteria(evidencesVariables);
      } else {
        setStudyVariables(evidencesVariables);
      }
    } catch (error) {
      onError();
    }
  }

  /**
   * Get the expression of the study variables.
   * This is used to display the datamart table headers.
   */
  const studyVariablesExpressions = studyVariables.map(
    (studyVariable) => studyVariable.expression
  );

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
    if (!param) return "";
    if (param.valueAge !== undefined) return param.valueAge.value;
    if (param.valueBoolean !== undefined) return param.valueBoolean.toString();
    if (param.valueString) return param.valueString;
    if (param.valueInteger !== undefined) return param.valueInteger.toString();
    if (param.valueDecimal !== undefined) return param.valueDecimal.toString();
    if (param.valueQuantity !== undefined) return param.valueQuantity.value + " " + param.valueQuantity.unit;
    return "";
  }

  /**
   * Handle the export of the datamart.
   * This function is called when the user clicks on the "Export" button.
   */
  const handleExportDatamart = async () => {
    setLoading(true);
    try {
      const response = await StudyService.executeExportDatamart(studyId ?? "");
      // csvData is base64 encoded, so we need to decode it
      let csvData = Buffer.from(response.data, "base64").toString();
      let type = "text/csv";
      // Create a blob from the csvData and create a URL for it
      let responseStrigified = new Blob([csvData], { type });
      // Create a link to download the file
      let csvUrl = URL.createObjectURL(responseStrigified);
      // Create a link element
      let link = document.createElement("a");
      // Set the link attributes
      link.href = csvUrl;
      // Set the file name and type
      link.download = `datamart_${studyId}.csv`;
      // Set the link to be invisible
      document.body.appendChild(link);
      // Click the link to download the file
      link.click();
      // Remove the link from the document
      document.body.removeChild(link);
    } catch (error) {
      onError();
    } finally {
      setLoading(false);
    }
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <LegioPage
      titleKey="title.studydetails"
      titleAction={
        <FontAwesomeIcon
          icon={faPen}
          size="xl"
          cursor={"pointer"}
          onClick={() => setIsEditingForm(!isEditingForm)}
        />
      }
      loading={loading}
    >
      <>
        {/* Section with the ResearchStudy details  */}
        <InformationSection
          isEditing={isEditingForm}
          fields={[
            {
              label: "ID",
              value: studyId,
              editable: false,
            },
            {
              label: i18n.t("label.name"),
              value: studyDetails.name,
              type: "text",
              onChange: (value: string) => {
                setStudyDetails((prev) => ({ ...prev, name: value }));
              },
            },
            {
              label: i18n.t("label.title"),
              value: studyDetails.title,
              type: "text",
              onChange: (value: string) => {
                setStudyDetails((prev) => ({ ...prev, title: value }));
              },
            },
            {
              label: i18n.t("label.status"),
              value: studyDetails.status,
              type: "status",
              onChange: (value: string) => {
                setStudyDetails((prev) => ({ ...prev, status: value }));
              },
            },
            {
              label: i18n.t("label.generaldescription"),
              value: studyDetails.description,
              type: "textarea",
              onChange: (value: string) => {
                setStudyDetails((prev) => ({ ...prev, description: value }));
              },
            },
            {
              label: "Version",
              value: studyDetails.version ?? "N/A",
              // TODO, should be required
              type: "text",
              onChange: (value: string) => {
                setStudyDetails((prev) => ({ ...prev, version: value }));
              },
            },
            {
              label: i18n.t("label.nctid"),
              value: studyDetails.nctId,
              type: "text",
              onChange: (value: string) => {
                setStudyDetails((prev) => ({ ...prev, nctId: value }));
              },
            },
            {
              label: i18n.t("label.localcontact"),
              value: studyDetails.localContact,
              type: "text",
              onChange: (value: string) => {
                setStudyDetails((prev) => ({ ...prev, localContact: value }));
              },
            },
            {
              label: i18n.t("label.studysponsorcontact"),
              value: studyDetails.studySponsorContact,
              type: "text",
              onChange: (value: string) => {
                setStudyDetails((prev) => ({
                  ...prev,
                  studySponsorContact: value,
                }));
              },
            },
            {
              label: "Phase",
              value: studyDetails.phase,
              editable: false,
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

        {/* Section with the Inclusion Criteria and Study Variables accordeons  */}
        <EvidenceVariableSection
          evidenceVariables={inclusionCriteria}
          type="inclusion"
        />
        <EvidenceVariableSection
          evidenceVariables={studyVariables}
          type="study"
        />

        {/* Warning message if no study variables are found */}
        {studyVariables.length === 0 && (
          <Alert variant="warning" className="mt-3">
            <FontAwesomeIcon icon={faWarning} className="me-2" />
            {i18n.t("errormessage.nogenerateddatamart")}
          </Alert>
        )}

        {/* Buttons*/}
        <div className="d-flex justify-content-end mt-3">
          {/* Button to generate the datamart*/}
          <Button
            variant="primary"
            onClick={handleCohortingAndDatamart}
            disabled={studyVariables.length === 0}
          >
            {i18n.t("button.generate")}
          </Button>
          {/* Button to export the datamart*/}
          <Button
            variant="primary"
            onClick={handleExportDatamart}
            disabled={
              !isExistingDatamartListId ||
              studyVariablesExpressions.length === 0
            }
            className="ms-2"
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            {i18n.t("button.export")}
          </Button>
        </div>

        {/* Section to show the table with the generated datamart  */}
        {datamartResult && (
          <div className="mt-4">
            {studyVariablesExpressions.length > 0 && (
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
                    ...studyVariables.map((studyVariable) => ({
                      header: studyVariable.expression ?? "N/A",
                      dataField: studyVariable.expression ?? "N/A",
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
                      subjectParam?.valueIdentifier?.value ?? "N/A";
                    // Extract all other parameters and set them to "N/A" if not found
                    studyVariables.forEach((studyVariable) => {
                      const paramName = studyVariable.expression ?? "N/A";
                      data[paramName] = "N/A";
                    });
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
            )}
          </div>
        )}
        {isEditingForm && (
          <Button className="mt-3" onClick={handleSave}>
            {i18n.t("button.save")}
          </Button>
        )}
      </>
    </LegioPage>
  );
};

export default StudyDetails;
