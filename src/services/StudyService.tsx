// Resources
import { Bundle, ResearchStudy } from "fhir/r5";
// FHIR
import { createFhirClient } from "./FhirClientFactory";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirClient = createFhirClient();

/**
 * Load Study from the back to populate the fields.
 *
 * @returns the promise of a Study.
 */
async function loadStudy(studyId: string): Promise<ResearchStudy> {
  return fhirClient.read({
    resourceType: "ResearchStudy",
    id: studyId ?? "",
  }) as Promise<ResearchStudy>;
}

/**
 *  Load the inclusion criteria for a study.
 * @param studyId The study id to load the inclusion criteria for.
 * @returns A promise of a Bundle containing the inclusion criteria.
 */
async function loadInclusionCriteria(studyId: string): Promise<Bundle> {
  return fhirClient.search({
    resourceType: "ResearchStudy",
    searchParams: { _id: studyId ?? "", _include: "ResearchStudy:eligibility" },
  }) as Promise<Bundle>;
}

/**
 * Load the study variables for a study.
 * @param studyId The study id to load the study variables for.
 * @returns A promise of a Bundle containing the study variables.
 */
async function loadStudyVariables(studyId: string): Promise<Bundle> {
  return fhirClient.search({
    resourceType: "ResearchStudy",
    searchParams: { _id: studyId ?? "", _include: "ResearchStudy:study-variables" },
  }) as Promise<Bundle>;
}

////////////////////////////
//        Exports         //
////////////////////////////

const StudyService = {
  loadStudy,
  loadInclusionCriteria,
  loadStudyVariables,
};

export default StudyService;