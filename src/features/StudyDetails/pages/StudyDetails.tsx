// React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import LegioPage from "../../../shared/components/LegioPage/LegioPage";
import InformationSection from "../components/InformationSection/InformationSection";
import EvidenceVariableSection from "../components/EvidenceVariableSection/EvidenceVariableSection";
import EvidenceVariableModal from "../components/CustomEvidenceVariableModal/Modals/EvidenceVariableModal";
import ExistingInclusionCriteriaForm from "../components/CustomEvidenceVariableModal/Modals/ExistingInclusionCriteriaForm";
import ExistingCanonicalCriteriaForm from "../components/CustomEvidenceVariableModal/Modals/ExistingCanonicalCriteriaForm";
import CanonicalForm from "../components/CustomEvidenceVariableModal/Modals/CanonicalForm";
import ExpressionForm from "../components/CustomEvidenceVariableModal/Modals/ExpressionForm";
import CombinationForm from "../components/CustomEvidenceVariableModal/Modals/CombinationForm";
// Services
import StudyService from "../services/study.service";
import EvidenceVariableService from "../services/evidenceVariable.service";
// Model
import {
  EvidenceVariableModel,
  EvidenceVariableUtils,
} from "../../../shared/models/EvidenceVariable.model";
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
// Types
import {
  CanonicalFormData,
  CombinationFormData,
  EvidenceVariableActionType,
  ExistingCanonicalCriteriaFormData,
  ExistingCanonicalFormData,
  ExpressionFormData,
  FormEvidenceVariableData,
} from "../types/evidenceVariable.types";

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

  // State to manage the ResearchStudy study design value set
  const [researchStudyStudyDesign, setResearchStudyStudyDesign] = useState(
    [] as SimpleCode[]
  );

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

  // State to manage the actual version of the study
  const [actualVersion, setActualVersion] = useState<string>("");

  // State to manage editing mode
  const [isEditingForm, setIsEditingForm] = useState(false);

  // Inclusion criteria array
  const [inclusionCriteria, setInclusionCriteria] = useState<
    EvidenceVariableModel[]
  >([]);

  // Study variables array
  const [studyVariables, setStudyVariables] = useState<EvidenceVariableModel[]>(
    []
  );

  // Current path for action (used for modals to know where to add the criteria)
  const [currentActionPath, setCurrentActionPath] = useState<
    number[] | undefined
  >();

  // Cohorting and datamart generation result
  const [datamartResult, setDatamartResult] = useState<List | undefined>();

  // Existing datamart list ID, used to check if a datamart already exists for the study
  const [isExistingDatamartListId, setIsExistingDatamartListId] =
    useState<boolean>(false);

  // TODO : To test the modals
  const [showExistingStudyVariableModal, setShowExistingStudyVariableModal] =
    useState(false);
  const [showStudyVariableModal, setShowStudyVariableModal] = useState(false);
  const [showExistingCriteriaModal, setShowExistingCriteriaModal] =
    useState(false);
  const [showNewCriteriaModal, setShowNewCriteriaModal] = useState(false);
  const [showCombinationModal, setShowCombinationModal] = useState(false);
  const [showExpressionModal, setShowExpressionModal] = useState(false);
  const [showExistingCanonicalModal, setShowExistingCanonicalModal] =
    useState(false);
  const [showNewCanonicalModal, setShowNewCanonicalModal] = useState(false);

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
      loadEvidenceVariablesHandler("inclusion");
      loadEvidenceVariablesHandler("study");
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
   * Handle actions for inclusion criteria
   * @param actionType The type of action to perform (new or existing).
   * @param path The path to the characteristic where the action is performed.
   */
  const handleInclusionCriteriaAction = (
    actionType: EvidenceVariableActionType,
    path?: number[]
  ) => {
    setCurrentActionPath(path);
    switch (actionType) {
      case "new":
        setShowNewCriteriaModal(true);
        break;
      case "existing":
        setShowExistingCriteriaModal(true);
        break;
      case "combination":
        setShowCombinationModal(true);
        break;
      case "expression":
        setShowExpressionModal(true);
        break;
      case "existingCanonical":
        setShowExistingCanonicalModal(true);
        break;
      case "newCanonical":
        setShowNewCanonicalModal(true);
        break;
      default:
        break;
    }
  };

  /**
   * Determine if the alert about combination absence should be shown.
   * @returns True if the alert about combination absence should be shown, false otherwise.
   */
  const showCombinationAbsenceAlert = () => {
    if (
      inclusionCriteria.length > 0 &&
      !inclusionCriteria[0].hasCharacteristic()
    ) {
      return true;
    }
    return false;
  };

  /**
   * Save an evidence variable as inclusion criteria.
   * @param evidenceVariableId The id of the evidence variable to save as inclusion criteria.
   */
  const saveInclusionCriteria = async (evidenceVariableId: string) => {
    await StudyService.addEvidenceVariableToStudy(
      studyId!,
      evidenceVariableId,
      "inclusion"
    );
    await loadEvidenceVariablesHandler("inclusion");
  };

  /**
   * Handle the creation of a new evidence variable.
   * @param data The data of the new evidence variable to create.
   */
  const handleSaveNewCriteria = async (data: FormEvidenceVariableData) => {
    try {
      setLoading(true);
      const createdEV =
        await EvidenceVariableService.createSimpleEvidenceVariable(data);
      await saveInclusionCriteria(createdEV.id!);
      setShowNewCriteriaModal(false);
    } catch (error) {
      console.error("Error creating criteria:", error);
      alert(i18n.t("errormessage.errorwhileaddingcriteria") + error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the addition of an existing evidence variable.
   * @param data The data of the existing evidence variable to add.
   */
  const handleSaveExistingCriteria = async (data: {
    selectedEvidenceVariable?: FormEvidenceVariableData;
  }) => {
    try {
      setLoading(true);
      await saveInclusionCriteria(data.selectedEvidenceVariable!.id!);
      setShowExistingCriteriaModal(false);
    } catch (error) {
      console.error("Error adding existing criteria:", error);
      alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the addition of a combination
   */
  const handleSaveCombination = async (data: CombinationFormData) => {
    try {
      setLoading(true);
      // The inclusion criteria should only have one parent EvidenceVariable
      if (inclusionCriteria.length > 0) {
        const parentEVId = inclusionCriteria[0].getId();
        await EvidenceVariableService.addDefinitionByCombination(
          parentEVId!,
          data,
          currentActionPath
        );
        await loadEvidenceVariablesHandler("inclusion");
        setShowCombinationModal(false);
        setCurrentActionPath(undefined);
      } else {
        alert(i18n.t("errormessage.noevidencevariablefound"));
      }
    } catch (error) {
      console.error("Error adding combination:", error);
      alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the addition of an expression
   */
  const handleSaveExistingCanonical = async (
    data: ExistingCanonicalCriteriaFormData
  ) => {
    try {
      setLoading(true);
      if (inclusionCriteria.length > 0) {
        const parentEVId = inclusionCriteria[0].getId();
        if (!data.selectedEvidenceVariable?.url) {
          alert(i18n.t("errormessage.nourlontheevidencevariable"));
          return;
        }
        // Data to create the canonical evidence variable
        const canonicalData: ExistingCanonicalFormData = {
          exclude: data.exclude,
          canonicalUrl: data.selectedEvidenceVariable!.url,
          canonicalId: data.selectedEvidenceVariable!.identifier,
          canonicalDescription: data.selectedEvidenceVariable!.title,
        };
        await EvidenceVariableService.addExistingCanonical(
          parentEVId!,
          canonicalData,
          currentActionPath
        );
        await loadEvidenceVariablesHandler("inclusion");
        setShowExistingCanonicalModal(false);
        setCurrentActionPath(undefined);
      }
    } catch (error) {
      console.error("Error adding existing canonical:", error);
      alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the creation of a new canonical evidence variable.
   * @param data The data of the new canonical evidence variable to create.
   */
  const handleSaveNewCanonical = async (data: CanonicalFormData) => {
    try {
      setLoading(true);
      if (inclusionCriteria.length > 0) {
        const parentEVId = inclusionCriteria[0].getId();
        await EvidenceVariableService.addNewCanonical(
          parentEVId!,
          data.evidenceVariable,
          data.exclude,
          currentActionPath
        );
        await loadEvidenceVariablesHandler("inclusion");
        setShowNewCanonicalModal(false);
        setCurrentActionPath(undefined);
      } else {
        alert(i18n.t("errormessage.noevidencevariablefound"));
      }
    } catch (error) {
      console.error("Error adding new canonical:", error);
      alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle the addition of an expression
   */
  const handleSaveExpression = async (data: ExpressionFormData) => {
    try {
      setLoading(true);
      if (inclusionCriteria.length > 0) {
        const parentEVId = inclusionCriteria[0].getId();
        await EvidenceVariableService.addDefinitionExpression(
          parentEVId!,
          data,
          currentActionPath
        );
        await loadEvidenceVariablesHandler("inclusion");
        setShowExpressionModal(false);
        setCurrentActionPath(undefined);
      } else {
        alert(i18n.t("errormessage.noevidencevariablefound"));
      }
    } catch (error) {
      console.error("Error adding expression:", error);
      alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
    } finally {
      setLoading(false);
    }
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
   * Function to load evidence variables (inclusion criteria or study variables) from the backend.
   *
   * @param type The type of evidence variable to load (inclusion or study)
   */
  async function loadEvidenceVariablesHandler(type: "inclusion" | "study") {
    try {
      const evidencesVariables =
        await EvidenceVariableService.loadEvidenceVariables(
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
  const studyVariablesExpressions =
    EvidenceVariableUtils.extractExpressions(studyVariables);

  /**
   * To display the Inclusion Criteria
   */
  const inclusionCriteriaDisplayObjects =
    EvidenceVariableUtils.toDisplayObjects(inclusionCriteria);

  /**
   * To display the Study Variable
   */
  const studyVariablesDisplayObjects =
    EvidenceVariableUtils.toDisplayObjects(studyVariables);

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
        <EvidenceVariableSection
          evidenceVariables={inclusionCriteriaDisplayObjects}
          type="inclusion"
          editMode={isEditingForm}
          onAction={handleInclusionCriteriaAction}
          evidenceVariableModels={inclusionCriteria}
        />
        <EvidenceVariableSection
          evidenceVariables={studyVariablesDisplayObjects}
          type="study"
          evidenceVariableModels={studyVariables}
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
                      header: studyVariable.getExpression() ?? "N/A",
                      dataField: studyVariable.getExpression() ?? "N/A",
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
                      const paramName = studyVariable.getExpression() ?? "N/A";
                      data[paramName] = "N/A";
                    });
                    resource.parameter.forEach((param: any) => {
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
            {i18n.t("button.savechanges")}
          </Button>
        )}

        {/* To create a new Inclusion Criteria */}
        {showNewCriteriaModal && (
          <EvidenceVariableModal
            show={showNewCriteriaModal}
            mode="create"
            type="inclusion"
            onHide={() => setShowNewCriteriaModal(false)}
            onSave={handleSaveNewCriteria}
          />
        )}
        {/* To link an existing Inclusion Criteria */}
        {showExistingCriteriaModal && (
          <ExistingInclusionCriteriaForm
            show={showExistingCriteriaModal}
            mode="create"
            onHide={() => setShowExistingCriteriaModal(false)}
            onSave={handleSaveExistingCriteria}
          />
        )}
        {/* To link an existing Canonical Criteria with a definitionCanonical */}
        {showExistingCanonicalModal && (
          <ExistingCanonicalCriteriaForm
            show={showExistingCanonicalModal}
            mode="create"
            onHide={() => setShowExistingCanonicalModal(false)}
            onSave={handleSaveExistingCanonical}
            showCombinationAlert={showCombinationAbsenceAlert()}
          />
        )}
        {/* To create a new Canonical Criteria with a definitionCanonical */}
        {showNewCanonicalModal && (
          <CanonicalForm
            show={showNewCanonicalModal}
            mode="create"
            onHide={() => setShowNewCanonicalModal(false)}
            onSave={handleSaveNewCanonical}
            showCombinationAlert={showCombinationAbsenceAlert()}
          />
        )}
        {/* To add a definitionExpression into the EvidenceVariable */}
        {showExpressionModal && (
          <ExpressionForm
            show={showExpressionModal}
            mode="create"
            onHide={() => setShowExpressionModal(false)}
            onSave={handleSaveExpression}
            showCombinationAlert={showCombinationAbsenceAlert()}
          />
        )}
        {showCombinationModal && (
          <CombinationForm
            show={showCombinationModal}
            mode="create"
            onHide={() => setShowCombinationModal(false)}
            onSave={handleSaveCombination}
          />
        )}
      </>
    </LegioPage>
  );
};

export default StudyDetails;
