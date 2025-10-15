//React
import { FunctionComponent, useEffect, useState } from "react";
// Components
import { InclusionCriteriaValue } from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front Library
import { SimpleCode, ValueSetLoader } from "@fyrstain/hl7-front-library";
// FHIR
import Client from "fhir-kit-client";
// Hook
import { ValidationErrors } from "../../../../hooks/useFormValidation";

/**
 * Component for handling code parameters in inclusion criteria.
 *
 * @param value - The current InclusionCriteriaValue object
 * @param onChange - Callback function to handle changes to the value
 * @param errors - Optional errors object for validation messages
 * @returns JSX.Element representing the code parameter form
 */
const CodingParameter: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
  errors?: ValidationErrors;
  validateField: (field: string, value: any, isRequired?: boolean) => void;
  readonly?: boolean;
}> = ({ value, onChange, errors, validateField, readonly = false }) => {
  /////////////////////////////////////
  //             Client              //
  /////////////////////////////////////

  // FHIR Client for ValueSet operations
  const fhirClient = new Client({
    baseUrl: process.env.REACT_APP_TERMINOLOGY_URL ?? "fhir",
  });

  // ValueSet Loader for fetching codes
  const valueSetLoader = new ValueSetLoader(fhirClient);

  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  // The currently selected ValueSet URL
  const [selectedValueSet, setSelectedValueSet] = useState<string>("");
  // The CodeSystem URL associated with the selected ValueSet
  const [selectedCodeSystem, setSelectedCodeSystem] = useState<string | null>(
    null
  );
  // The codes available for the selected ValueSet
  const [availableCodes, setAvailableCodes] = useState<SimpleCode[]>([]);
  // The currently selected code
  const [selectedCode, setSelectedCode] = useState<string>("");

  /////////////////////////////////////
  //           LifeCycle             //
  /////////////////////////////////////

  useEffect(() => {
    // Complete reset: clear everything
    setSelectedValueSet("");
    setAvailableCodes([]);
    setSelectedCode("");
    setSelectedCodeSystem(null);

    // Then load the real values if they exist
    if (value?.valueSetUrl) {
      setSelectedValueSet(value.valueSetUrl);
      // Always load the codes from the ValueSet, even in readonly mode
      valueSetLoader.searchValueSet(value.valueSetUrl).then((codes) => {
        setAvailableCodes(codes || []);
        // Extract CodeSystem from the first code if available
        if (codes && codes.length > 0 && codes[0].system) {
          setSelectedCodeSystem(codes[0].system);
        }
      });
    }
    // Set the selected code if exists
    if (value?.value) {
      let codeToDisplay = "";
      // Determine the code to display based on the value type
      if (typeof value.value === "string") {
        codeToDisplay = value.value;
      } else if (value.value && typeof value.value === "object") {
        codeToDisplay = (value.value as any)?.code || "";
      }

      setSelectedCode(codeToDisplay);
    }
  }, [value, readonly]);
  
  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Function to handle code selection
   * @param codeValue The selected code value
   */
  const handleCodeSelection = (codeValue: string) => {
    setSelectedCode(codeValue);

    // If we have a CodeSystem from the ValueSet, create a proper Coding object
    if (selectedCodeSystem) {
      const codingValue = {
        system: selectedCodeSystem,
        code: codeValue,
      };
      onChange({
        ...value,
        value: codingValue,
        valueSetUrl: selectedValueSet,
      });
    } else {
      // No CodeSystem available, just pass the code as a string
      onChange({
        ...value,
        value: codeValue,
        valueSetUrl: selectedValueSet,
      });
    }

    validateField("criteriaCode", codeValue, true);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <>
      {/* Code Selection */}
      <Form.Group>
        {availableCodes.length > 0 ? (
          <Form.Select
            value={selectedCode}
            onChange={(e) => handleCodeSelection(e.target.value)}
            isInvalid={!readonly && !!errors?.criteriaCode}
            disabled={readonly}
          >
            <option value="">{i18n.t("placeholder.selectcode")}</option>
            {availableCodes.map((code) => (
              <option key={code.code} value={code.code}>
                {code.display || code.code}
              </option>
            ))}
          </Form.Select>
        ) : (
          <Form.Control
            type="text"
            value={selectedCode}
            onChange={(e) => {
              const newCode = e.target.value;
              setSelectedCode(newCode);
              onChange({
                ...value,
                value: newCode,
              });
              validateField("criteriaCode", newCode, true);
            }}
            placeholder={i18n.t("placeholder.entercode")}
            isInvalid={!readonly && !!errors?.criteriaCode}
            disabled={readonly}
            readOnly={readonly}
          />
        )}
        {!readonly && (
          <Form.Control.Feedback type="invalid">
            {errors?.criteriaCode}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    </>
  );
};

export default CodingParameter;
