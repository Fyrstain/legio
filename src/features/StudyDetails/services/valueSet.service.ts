// Resources
import { Bundle, ValueSet } from "fhir/r5";
// Fhir
import Client from "fhir-kit-client";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirClient = new Client({
  baseUrl: process.env.REACT_APP_TERMINOLOGY_URL ?? "fhir",
});

/**
 * Load all active ValueSets from the FHIR server
 * 
 * @returns A promise that resolves to an array of ValueSets
 */
async function loadValueSets(): Promise<ValueSet[]> {
  try {
    const bundle = (await fhirClient.search({
      resourceType: "ValueSet",
    })) as Bundle;
    return bundle.entry?.map((entry) => entry.resource as ValueSet) || [];
  } catch (error) {
    throw new Error(`Error loading ValueSets: ${error}`);
  }
}

////////////////////////////
//        Exports         //
////////////////////////////

const ValueSetService = {
  loadValueSets,
};

export default ValueSetService;