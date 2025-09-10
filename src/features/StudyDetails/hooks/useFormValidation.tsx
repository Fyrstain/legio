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
  const [errors, setErrors] = useState<ValidationErrors>({});

  const hasNoErrors = Object.keys(errors).length === 0;

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
