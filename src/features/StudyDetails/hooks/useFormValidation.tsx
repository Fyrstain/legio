// React
import { useState } from "react";
// Translation
import i18n from "i18next";

////////////////////////////////
//           Types            //
////////////////////////////////

export interface ValidationErrors {
  [fieldName: string]: string;
}

export interface SimpleValidationResult {
  errors: ValidationErrors;
  isValid: boolean;
  validateField: (
    fieldName: string,
    value: any,
    isRequired?: boolean
  ) => string | null;
  clearErrors: () => void;
}

//////////////////////////
//         Hook         //
//////////////////////////
export const useFormValidation = (): SimpleValidationResult => {
  // State to hold validation errors
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Determine if the form is valid (no errors)
  const hasNoErrors = Object.keys(errors).length === 0;

  // Regular expression for validating IDs (LinkId) (alphanumeric, dashes, dots, 1-64 chars)
  const idRegex = /^[A-Za-z0-9\-\.]{1,64}$/;

  /**
   * Validate a form field.
   * @param fieldName The name of the field to validate.
   * @param value The value of the field.
   * @param isRequired Whether the field is required.
   * @returns An error message if validation fails, or null if it passes.
   */
  const validateField = (
    fieldName: string,
    value: any,
    isRequired = false
  ): string | null => {
    let error: string | null = null;
    // Validation for required fields
    if (
      isRequired &&
      (!value || (typeof value === "string" && !value.trim()))
    ) {
      error = i18n.t("errormessage.requiredfield");
    }
    // Validation for URL fields
    if (
      !error &&
      fieldName.includes("url") &&
      value &&
      typeof value === "string" &&
      value.trim()
    ) {
      try {
        new URL(value);
      } catch {
        error = i18n.t("errormessage.invalidurl");
      }
    }
    // Validation for ID fields
    if (
      !error &&
      (fieldName.toLowerCase().includes("id") ||
        fieldName === "combinationId") &&
      value &&
      typeof value === "string"
    ) {
      if (!idRegex.test(value)) {
        error = i18n.t("errormessage.invalidid");
      }
    }
    // Update errors state
    setErrors((prev) => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        delete prev[fieldName];
        return prev;
      }
    });
    return error;
  };

  /**
   * Clear all validation errors.
   */
  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    isValid: hasNoErrors,
    validateField,
    clearErrors,
  };
};
