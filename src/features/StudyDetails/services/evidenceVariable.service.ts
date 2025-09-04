// Resources
import { Bundle } from "fhir/r5";
// Client
import Client from "fhir-kit-client";
// Model
import { EvidenceVariableModel } from "../../../shared/models/EvidenceVariable.model";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirKnowledgeClient = new Client({
  baseUrl: process.env.REACT_APP_KNOWLEDGE_URL ?? "fhir",
});

async function loadAllEvidenceVariables(): Promise<Bundle> {
  return fhirKnowledgeClient.search({
    resourceType: "EvidenceVariable",
  }) as Promise<Bundle>;
}

/**
 *  Load the inclusion criteria for a study.
 *
 * @param studyId The study id to load the inclusion criteria for.
 * @returns A promise of a Bundle containing the inclusion criteria.
 */
async function loadInclusionCriteria(studyId: string): Promise<Bundle> {
  return fhirKnowledgeClient.search({
    resourceType: "EvidenceVariable",
    searchParams: {
      "_has:ResearchStudy:eligibility:_id": studyId,
    },
  }) as Promise<Bundle>;
}

/**
 * Load the study variables for a study.
 *
 * @param studyId The study id to load the study variables for.
 * @returns A promise of a Bundle containing the study variables.
 */
async function loadStudyVariables(studyId: string): Promise<Bundle> {
  return fhirKnowledgeClient.search({
    resourceType: "EvidenceVariable",
    searchParams: {
      "_has:ResearchStudy:study-variables:_id": studyId,
    },
  }) as Promise<Bundle>;
}

/**
 * Read an EvidenceVariable by its canonical URL.
 *
 * @param canonicalUrl The canonical URL of the EvidenceVariable to load
 * @returns A promise of a Bundle containing the requested EvidenceVariable
 */
async function readEvidenceVariableByUrl(
  canonicalUrl: string
): Promise<Bundle> {
  return fhirKnowledgeClient.search({
    resourceType: "EvidenceVariable",
    searchParams: {
      url: canonicalUrl,
    },
  }) as Promise<Bundle>;
}

/**
 * A function to load evidence variables for a study.
 *
 * @param studyId The study ID to load the evidence variables.
 * @param type The type of evidence variables to load (can be "inclusion" for Inclusion Criteria or "study" for Study Variable).
 * @returns A promise of an array of evidence variables.
 */
async function loadEvidenceVariables(
  studyId: string,
  type: "inclusion" | "study"
): Promise<EvidenceVariableModel[]> {
  const serviceMethod =
    type === "inclusion" ? loadInclusionCriteria : loadStudyVariables;
  try {
    // Load the bundle of evidence variables for the study
    const bundle = await serviceMethod(studyId ?? "");
    const { models, canonicalUrls } = EvidenceVariableModel.fromBundle(bundle);
    // If canonical URLs were found, read the EvidenceVariables by their URLs
    if (canonicalUrls.length > 0) {
      const canonicalResults = await Promise.all(
        canonicalUrls.map((url) => readEvidenceVariableByUrl(url))
      );
      // Convert the canonical results to EvidenceVariableModel instances
      return EvidenceVariableModel.fromCanonicalBundles(canonicalResults);
    }
    // If no canonical URLs were found, return the models directly
    return models;
  } catch (error) {
    throw new Error("Error loading evidence variables: " + error);
  }
}

////////////////////////////
//        Exports         //
////////////////////////////
const EvidenceVariableService = {
  loadAllEvidenceVariables,
  loadInclusionCriteria,
  loadStudyVariables,
  readEvidenceVariableByUrl,
  loadEvidenceVariables,
};

export default EvidenceVariableService;
