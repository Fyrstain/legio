// React
import { useState, useEffect, useCallback } from "react";
// Services
import ValueSetService from "../services/valueSet.service";
// HL7 Front Library
import { ValueSetLoader, SimpleCode } from "@fyrstain/hl7-front-library";
// FHIR
import Client from "fhir-kit-client";
// Types
import { InclusionCriteriaTypes } from "../types/evidenceVariable.types";

////////////////////////////////
//         Interface          //
////////////////////////////////

interface UseComparatorsResult {
  comparatorOptions: SimpleCode[];
  error: string | null;
}

//////////////////////////
//         Hook         //
//////////////////////////

export const useComparators = (
  parameterType: InclusionCriteriaTypes
): UseComparatorsResult => {
  //////////////////////////
  //        States        //
  //////////////////////////

  const [comparatorOptions, setComparatorOptions] = useState<SimpleCode[]>([]);
  const [error, setError] = useState<string | null>(null);

  /////////////////////////////////////
  //             Client              //
  /////////////////////////////////////

  // Create FHIR client instance
  const fhirClient = new Client({
    baseUrl: process.env.REACT_APP_TERMINOLOGY_URL ?? "fhir",
  });

  // Create ValueSetLoader instance to fetch ValueSets
  const valueSetLoader = new ValueSetLoader(fhirClient);

  /////////////////////////////////////
  //             Actions             //
  /////////////////////////////////////

  /**
   * Load comparator codes based on the parameter type
   */
  const loadComparators = useCallback(async () => {
    if (!parameterType) {
      setComparatorOptions([]);
      return;
    }
    setError(null);
    try {
      // Get the ValueSet URL for the given parameter type
      const valueSetUrl =
        ValueSetService.getComparatorValueSetUrl(parameterType);
      // If no URL is found, throw an error
      if (!valueSetUrl) {
        throw new Error(
          `No comparator ValueSet available for type: ${parameterType}`
        );
      }
      // To fetch codes from the ValueSet
      const codes = await valueSetLoader.searchValueSet(valueSetUrl);
      setComparatorOptions(codes);
    } catch (err) {
      // Handle errors appropriately
      console.error(`Error loading comparators for ${parameterType}:`, err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setComparatorOptions([]);
    }
  }, [parameterType, valueSetLoader]);

  /////////////////////////////////////
  //            LifeCycle            //
  /////////////////////////////////////

  useEffect(() => {
    loadComparators();
  }, [parameterType]);

  return {
    comparatorOptions,
    error,
  };
};
