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
    loadEvidenceVariables("inclusion");
    loadEvidenceVariables("study");
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
   * Function to load evidence variables (inclusion criteria or study variables) from the backend.
   *
   * @param type The type of evidence variable to load (inclusion or study)
   */
  async function loadEvidenceVariables(type: "inclusion" | "study") {
    const serviceMethod =
      type === "inclusion"
        ? StudyService.loadInclusionCriteria
        : StudyService.loadStudyVariables;
    try {
      // Load the evidence variables using the service method, first level of EvidenceVariable
      const response = await serviceMethod(studyId ?? "");
      const bundle = response as Bundle;
      const evidencesVariables: Array<{
        title: string;
        description: string;
        expression?: string;
      }> = [];
      if (bundle.entry) {
        const canonicalUrls: string[] = [];
        // Extract canonical URLs from the EvidenceVariable resources
        bundle.entry.forEach((entry) => {
          if (entry.resource?.resourceType === "EvidenceVariable") {
            const evidenceVariable = entry.resource as EvidenceVariable;
            evidenceVariable.characteristic?.forEach((characteristic) => {
              if (characteristic.definitionByCombination?.characteristic) {
                characteristic.definitionByCombination.characteristic.forEach(
                  (subCharacteristic) => {
                    if (subCharacteristic.definitionCanonical) {
                      canonicalUrls.push(subCharacteristic.definitionCanonical);
                    }
                  }
                );
              }
            });
          }
        });
        // If canonical URLs were found, load the EvidenceVariable resources using the URLs
        if (canonicalUrls.length > 0) {
          const canonicalResults = await Promise.all(
            canonicalUrls.map((url) =>
              StudyService.readEvidenceVariableByUrl(url)
            )
          );
          canonicalResults.forEach((result) => {
            if (
              result.entry?.[0]?.resource?.resourceType === "EvidenceVariable"
            ) {
              const evidenceVariable = result.entry[0]
                .resource as EvidenceVariable;
              const details = extractEvidenceVariableDetails(evidenceVariable);
              evidencesVariables.push(details);
            }
          });
        } else {
          // If no canonical URLs were found, use the original bundle entries
          // TODO : We'll need to delete this part for the V1 when the canonical URLs will be always present
          bundle.entry.forEach((entry) => {
            if (entry.resource?.resourceType === "EvidenceVariable") {
              const evidenceVariable = entry.resource as EvidenceVariable;
              const details = extractEvidenceVariableDetails(evidenceVariable);
              evidencesVariables.push(details);
            }
          });
        }
      }
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
   * Function to extract the details from an EvidenceVariable resource.
   *
   * @param evidenceVariable The EvidenceVariable resource to extract data from
   * @returns An object containing the title, description, and expression of the EvidenceVariable
   */
  function extractEvidenceVariableDetails(evidenceVariable: EvidenceVariable) {
    let expressionValue: string | undefined;
    if (evidenceVariable.characteristic) {
      evidenceVariable.characteristic.forEach((characteristic) => {
        if (characteristic.definitionByCombination) {
          expressionValue =
            characteristic.definitionByCombination?.characteristic?.[0]
              ?.definitionExpression?.expression;
        }
      });
    }
    return {
      title: evidenceVariable.title ?? "",
      description: evidenceVariable.description ?? "",
      expression: expressionValue,
    };
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
    if (param.valueBoolean !== undefined) return param.valueBoolean.toString();
    if (param.valueString) return param.valueString;
    if (param.valueInteger !== undefined) return param.valueInteger.toString();
    if (param.valueDecimal !== undefined) return param.valueDecimal.toString();
    return "";
  }

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <LegioPage titleKey="title.studydetails" loading={loading}>
      <>
        {/* Section with the ResearchStudy details  */}
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

        {/* Section with the Inclusion Criteria and Study Variables accordeons  */}
        <EvidenceVariableSection
          evidenceVariables={inclusionCriteria}
          type="inclusion"
        />
        <EvidenceVariableSection
          evidenceVariables={studyVariables}
          type="study"
        />

        {/* Button to generate the datamart */}
        <div className="d-flex justify-content-end mt-3">
          <Button
            variant="primary"
            onClick={handleCohortingAndDatamart}
            disabled={isExistingDatamartListId}
          >
            {i18n.t("button.generate")}
          </Button>
        </div>

        {/* Section to show the table with the generated datamart  */}
        {datamartResult && (
          <div className="mt-4">
            {studyVariablesExpressions.length > 0 ? (
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
            ) : (
              <Title
                level={4}
                content={i18n.t("errormessage.nogenerateddatamart")}
              ></Title>
            )}
          </div>
        )}
      </>
    </LegioPage>
  );
};

export default StudyDetails;
