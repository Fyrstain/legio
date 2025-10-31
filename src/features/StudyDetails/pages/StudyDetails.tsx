// React
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import LegioPage from "../../../shared/components/LegioPage/LegioPage";
import InformationSection from "../components/InformationSection/InformationSection";
import EvidenceVariableManager from "../components/EvidenceVariableManager/EvidenceVariableManager";
// Services
import StudyService from "../services/study.service";
// Model
import { EvidenceVariableModel } from "../../../shared/models/EvidenceVariable.model";
// Resources
import { List, ResearchStudy } from "fhir/r5";
// Translation
import i18n from "i18next";
// React
import { Alert, Button } from "react-bootstrap";
// HL7 Front Library
import {
  PaginatedTable,
  SimpleCode,
  Title,
  ValueSetLoader,
} from "@fyrstain/hl7-front-library";
// Buffer
import { Buffer } from "buffer";
// Font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faPen,
  faWarning,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
// Fhir
import Client from "fhir-kit-client";

const StudyDetails: FunctionComponent = () => {
  /////////////////////////////////////
  //             Client              //
  /////////////////////////////////////

  const fhirClient = new Client({
        baseUrl: process.env.REACT_APP_TERMINOLOGY_URL ?? "fhir",
  });

  const valueSetLoader = new ValueSetLoader(fhirClient);

  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  // URL for the ResearchStudy study design value set
  const researchStudyStudyDesignUrl =
    process.env.REACT_APP_VALUESET_RESEARCHSTUDYSTUDYDESIGN_URL ??
    "http://hl7.org/fhir/ValueSet/study-design";

  const [datamartListId, setDatamartListId] = useState<string>("");
  // State to manage the ResearchStudy study design value set
  const [researchStudyStudyDesign, setResearchStudyStudyDesign] = useState(
    [] as SimpleCode[]
  );

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Study informations
  const [studyResource, setStudyResource] = useState<ResearchStudy | null>(null);
  const { studyId } = useParams();
  const [inclusionCriteriaRef, setInclusionCriteriaRef] = useState<string>("");
  const [studyVariableRef, setStudyVariableRef] = useState<string>("");
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

  // State to manage the actual version of the study
  const [actualVersion, setActualVersion] = useState<string>("");

  // State to manage editing mode
  const [isEditingForm, setIsEditingForm] = useState(false);

  // Study variables array
  const [studyVariables, setStudyVariables] = useState<EvidenceVariableModel[]>(
    []
  );

  // Cohorting and datamart generation result
  const [datamartResult, setDatamartResult] = useState<List | undefined>();

  // Existing datamart list ID, used to check if a datamart already exists for the study
  const [isExistingDatamartListId, setIsExistingDatamartListId] =
    useState<boolean>(false);

  // A flag to indicate if no patients were found during cohorting, to show a warning
  const [noPatientsFound, setNoPatientsFound] = useState(false);
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
    if (studyId) {
      loadStudy();
    }
  }, [studyId]);

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
      // Load the value set for study design
      const studyDesignValueSet = await valueSetLoader.searchValueSet(
        researchStudyStudyDesignUrl
      );
      setResearchStudyStudyDesign(studyDesignValueSet);
      // Load the ResearchStudy resource from the backend
      const response = await StudyService.loadStudy(studyId ?? "");
      const study: ResearchStudy = response as ResearchStudy;
      setStudyResource(study);
      // Extract inclusion criteria reference
      const inclusionRef = study.recruitment?.eligibility?.reference || "";
      setInclusionCriteriaRef(inclusionRef.replace("EvidenceVariable/", ""));
      // Extract study variable reference
      const studyVarRef = study.extension
      ?.find(ext => ext.url === "https://www.isis.com/StructureDefinition/EXT-Datamart")
      ?.extension?.find(ext => ext.url === "variable")
      ?.valueReference?.reference || "";
      setStudyVariableRef(studyVarRef.replace("EvidenceVariable/", ""));
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
      // Extract study design codes
      const studyDesignCodes = StudyService.extractStudyDesignCodes(study);
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
        phase:
          study.phase?.coding?.[0]?.display ??
          study.phase?.coding?.[0]?.code ??
          "N/A",
        studyDesign: studyDesignCodes,
      };
      // Set the study details in the state
      setStudyDetails(studyData);
      // Set the actual version of the study
      setActualVersion(study.version ?? "");
    } catch (error) {
      onError();
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get the display values for the study design.
   *
   * @returns the display values for the study design.
   */
  const getStudyDesignDisplayValues = () => {
    // If studyDesign is not defined or is empty, return "N/A"
    if (!studyDetails.studyDesign || studyDetails.studyDesign.length === 0) {
      return ["N/A"];
    }
    // Map the study design codes to their display values
    return studyDetails.studyDesign.map((code) => {
      const option = researchStudyStudyDesign.find(
        (design) => design.code === code
      );
      return option?.display || code || "N/A";
    });
  };

  /**
   * Get the option element to represent the code in an Input Select.
   *
   * @param code the code.
   * @returns the option element.
   */
  function getOption(code: SimpleCode) {
    return { value: code.code, label: code.display ?? code.code };
  }

  /**
   * Get the validation state for the version field.
   *
   * @returns the validation state.
   */
  const getVersionValidation = () => {
    const version = studyDetails.version;
    // Check if version is empty
    if (!version || version.trim() === "") {
      return {
        isInvalid: true,
        errorMessage: i18n.t("errormessage.requiredfield"),
      };
    }
    // Check if version is the same as original
    if (version === actualVersion) {
      return {
        isInvalid: true,
        errorMessage: i18n.t("errormessage.versionalreadyexists"),
      };
    }
    // If all checks pass, return valid state
    return {
      isInvalid: false,
      errorMessage: "",
    };
  };

  /**
   * Update the ResearchStudy resource with the new values.
   *
   * @param updatedValues The new values to update
   */
  const handleSave = async () => {
    const versionValidation = getVersionValidation();
    // If the version is invalid, show an alert and return
    if (versionValidation.isInvalid) {
      alert(versionValidation.errorMessage);
      return;
    }
    try {
      // Update the ResearchStudy resource with the new values
      await StudyService.updateStudy(studyId ?? "", studyDetails);
      // Exit the editing mode
      setIsEditingForm(false);
      // Success message if the update is successful
      alert(i18n.t("message.studyupdated"));
      // Reload the study to get the updated values
      await loadStudy();
    } catch (error) {
      // Error message if the update fails
      alert(`${i18n.t("errormessage.errorwhilesavingstudy")} ${error}`);
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
   * Extracts the pure List ID from a FHIR Reference.
   * Works with both relative ("List/123") and absolute ("http://.../List/123") refs.
   * Used to query Parameters via: /Parameters?_has:List:item:_id={LIST_ID}
   */
  function extractListIdFromRef(ref?: string): string {
    if (!ref) return "";
    const m = ref.match(/(?:^|\/)List\/([^/?#]+)/);
    return m ? m[1] : ref.replace(/^List\//, "");
  }

  /**
   * Get the expression of the study variables.
   * This is used to display the datamart table headers.
   */
  const studyVariablesWithExpressions = useMemo(
    () => studyVariables.filter((v) => !!v.getExpression()),
    [studyVariables]
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
      if (response.datamartResult === null) {
        // No patients found
        setNoPatientsFound(true);
        setIsExistingDatamartListId(false);
        alert(i18n.t("message.noeligiblepatients"));
      } else {
        setDatamartResult(response.datamartResult);
        setIsExistingDatamartListId(true);
        setNoPatientsFound(false);
      }
    } catch (error) {
      onError();
    } finally {
      setLoading(false);
    }
  };

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

  /**
   * After $generate-datamart, reload the ResearchStudy to get the evaluation List,
   * then extract its List ID for the table query.
   */
  useEffect(() => {
    if (!studyId || !datamartResult?.id) return;

    (async () => {
      try {
        const rs = await StudyService.loadStudy(studyId);
        const evalRef = rs.extension
          ?.find(
            (e: any) =>
              e.url === "https://www.isis.com/StructureDefinition/EXT-Datamart"
          )
          ?.extension?.find((se: any) => se.url === "evaluation")
          ?.valueReference?.reference;

        setDatamartListId(extractListIdFromRef(evalRef));
      } catch (e) {
        console.error(
          "[Datamart] Unable to reload ResearchStudy for evaluation List:",
          e
        );
        setDatamartListId("");
      }
    })();
  }, [studyId, datamartResult?.id]);

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <LegioPage
      titleKey="title.studydetails"
      pageAction={
        <FontAwesomeIcon
          icon={isEditingForm ? faXmark : faPen}
          className="repeat-cross"
          size="xl"
          onClick={() => {
            if (isEditingForm) {
              setIsEditingForm(false);
              loadStudy();
            } else {
              setIsEditingForm(true);
            }
          }}
          title={i18n.t(isEditingForm ? "button.cancel" : "button.editstudy")}
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
              isEditable: false,
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
              label: isEditingForm ? "Version *" : "Version",
              value: studyDetails.version ?? "N/A",
              type: "text",
              isRequired: true,
              isInvalid: isEditingForm
                ? getVersionValidation().isInvalid
                : false,
              errorMessage: isEditingForm
                ? getVersionValidation().errorMessage
                : "",
              onChange: (value: string) => {
                setStudyDetails((prev) => ({ ...prev, version: value }));
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
              isEditable: false,
            },
            {
              label: i18n.t("label.studydesign"),
              value: isEditingForm
                ? studyDetails.studyDesign
                : getStudyDesignDisplayValues(),
              type: isEditingForm ? "select-list" : "list",
              options: researchStudyStudyDesign.map(getOption),
              onChange: (value: string[]) => {
                setStudyDetails((prev) => ({
                  ...prev,
                  studyDesign: value,
                }));
              },
            },
          ]}
        />
        {/* Section with the Inclusion Criteria and Study Variables accordeons  */}
        <EvidenceVariableManager
          studyId={studyId!}
          study={studyResource!}
          editMode={isEditingForm}
          inclusionCriteriaRef={inclusionCriteriaRef}
          studyVariableRef={studyVariableRef}
          onLoading={setLoading}
          onError={onError}
          onStudyVariablesChange={setStudyVariables}
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
            disabled={!isExistingDatamartListId || studyVariables.length === 0}
            className="ms-2"
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            {i18n.t("button.export")}
          </Button>
        </div>

        {/* Warning message if no patients were found during cohorting */}
        {noPatientsFound && (
          <Alert variant="warning" className="mt-4">
            <FontAwesomeIcon icon={faWarning} className="me-2" />
            {i18n.t("message.noeligiblepatients")}
          </Alert>
        )}

        {/* Section to show the table with the generated datamart  */}
        {datamartResult && !noPatientsFound && (
          <div className="mt-4">
            {studyVariablesWithExpressions.length > 0 && (
              <>
                <Title
                  level={3}
                  content={i18n.t("label.generateddatamart")}
                ></Title>
                <PaginatedTable
                  columns={[
                    { header: "Patient", dataField: "subjectId", width: "30%" },
                    ...studyVariablesWithExpressions.map((v) => ({
                      header: v.getExpression()!,
                      dataField: v.getExpression()!,
                    })),
                  ]}
                  mapResourceToData={(resource: any) => {
                    const data: any = {};
                    const subjectParam = (resource.parameter ?? []).find(
                      (p: any) => p.name === "Patient"
                    );
                    data.subjectId =
                      subjectParam?.valueIdentifier?.value ?? "N/A";

                    // init only for variables that have expressions
                    studyVariablesWithExpressions.forEach((v) => {
                      const name = v.getExpression()!;
                      data[name] = "N/A";
                    });

                    (resource.parameter ?? []).forEach((param: any) => {
                      if (param.name !== "Patient") {
                        data[param.name] =
                          StudyService.getParameterValue(param);
                      }
                    });
                    return data;
                  }}
                  searchProperties={{
                    serverUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
                    resourceType: "Parameters",
                    searchParameters: {
                      "_has:List:item:_id": datamartListId || "",
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
            {i18n.t("button.savechanges")}
          </Button>
        )}
      </>
    </LegioPage>
  );
};

export default StudyDetails;
