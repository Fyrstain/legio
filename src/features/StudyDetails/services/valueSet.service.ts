// Resources
import { Bundle, ValueSet } from "fhir/r5";
// Fhir
import Client from "fhir-kit-client";
// Types
import { InclusionCriteriaTypes } from "../types/evidenceVariable.types";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirClient = new Client({
  baseUrl: process.env.REACT_APP_TERMINOLOGY_URL ?? "fhir",
});

/////////////////////////////////////
//            Constants            //
/////////////////////////////////////

// ValueSet URLs for comparators
const COMPARATOR_VALUESETS = {
  integer:
    process.env.REACT_APP_VALUESET_INTEGER_COMPARATOR_URL ||
    "https://www.centreantoinelacassagne.org/ValueSet/VS-integer-comparator",
  date:
    process.env.REACT_APP_VALUESET_DATE_COMPARATOR_URL ||
    "https://www.centreantoinelacassagne.org/ValueSet/VS-date-comparator",
  boolean:
    process.env.REACT_APP_VALUESET_BOOLEAN_COMPARATOR_URL ||
    "https://www.centreantoinelacassagne.org/ValueSet/VS-boolean-comparator",
  code:
    process.env.REACT_APP_VALUESET_CODE_COMPARATOR_URL ||
    "https://www.centreantoinelacassagne.org/ValueSet/VS-code-comparator",
} as const;

/////////////////////////////////////
//            Functions            //
/////////////////////////////////////

/**
 * Load all active ValueSets from the FHIR server
 *
 * @returns A promise that resolves to an array of ValueSets
 */
async function loadValueSets(): Promise<ValueSet[]> {
  try {
    const bundle = (await fhirClient.search({
      resourceType: "ValueSet",
      searchParams: { _count: 10000 },
    })) as Bundle;
    return bundle.entry?.map((entry) => entry.resource as ValueSet) || [];
  } catch (error) {
    throw new Error(`Error loading ValueSets: ${error}`);
  }
}

/**
 * Get the appropriate comparator ValueSet URL for a parameter type
 *
 * @param parameterType The type of parameter (integer, date, boolean, code)
 * @returns The ValueSet URL or null if not found
 */
function getComparatorValueSetUrl(
  parameterType: InclusionCriteriaTypes
): string | null {
  return COMPARATOR_VALUESETS[parameterType] || null;
}

////////////////////////////
//        Exports         //
////////////////////////////

const ValueSetService = {
  loadValueSets,
  getComparatorValueSetUrl,
};

export default ValueSetService;
