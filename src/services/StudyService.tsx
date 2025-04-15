// Resources
import { ResearchStudy } from "fhir/r5";
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

////////////////////////////
//        Exports         //
////////////////////////////

const StudyService = {
  loadStudy,
};

export default StudyService;