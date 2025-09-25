//React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Components
import { InclusionCriteriaValue } from "../../../../types/evidenceVariable.types";
// React Bootstrap
import { Alert, Form } from "react-bootstrap";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
// Translation
import i18n from "i18next";
// HL7 Front Library
import { SimpleCode, ValueSetLoader } from "@fyrstain/hl7-front-library";
// FHIR
import Client from "fhir-kit-client";
// Resources
import { ValueSet } from "fhir/r5";
// Services
import ValueSetService from "../../../../services/valueSet.service";
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

  const navigate = useNavigate();

  // All the ValueSets available
  const [valueSets, setValueSets] = useState<ValueSet[]>([]);
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

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  /**
   * Navigate to the error page.
   */
  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  /////////////////////////////////////
  //           LifeCycle             //
  /////////////////////////////////////

  // To load value sets data
  useEffect(() => {
    const loadValueSetsData = async () => {
      try {
        const valueSetsData = await ValueSetService.loadValueSets();
        setValueSets(valueSetsData);
      } catch (error) {
        onError();
      }
    };
    loadValueSetsData();
  }, []);

  // TODO : CHANGE this useEffect
  useEffect(() => {
    if (!value || value.type !== "coding") return;
    const isCodingObject = (
      v: any
    ): v is { system?: string; code?: string; display?: string } =>
      typeof v === "object" && v !== null && ("code" in v || "system" in v);
    if (value.valueSetUrl) {
      setSelectedValueSet(value.valueSetUrl);
      valueSetLoader.searchValueSet(value.valueSetUrl).then((codes) => {
        setAvailableCodes(codes || []);
        if (isCodingObject(value.value) && value.value.code) {
          setSelectedCode(value.value.code);
        } else if (typeof value.value === "string") {
          setSelectedCode(value.value);
        }
      });
    } else if (value.value) {
      if (typeof value.value === "string") {
        setSelectedCode(value.value);
        setAvailableCodes([
          { code: value.value, display: value.value, system: "" },
        ]);
        setSelectedCodeSystem("");
      } else if (isCodingObject(value.value)) {
        const coding = value.value;
        setSelectedCode(coding.code ?? "");
        setSelectedCodeSystem(coding.system ?? null);
        setAvailableCodes([
          {
            code: coding.code ?? "",
            display: coding.display ?? coding.code ?? "",
            system: coding.system ?? "",
          },
        ]);
      }
    } else {
      setSelectedCode("");
      setAvailableCodes([]);
    }
  }, [value]);

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Get the CodeSystem URL from a ValueSet
   * @param valueSet The ValueSet from which to extract the CodeSystem
   * @returns The CodeSystem URL or null if not found
   */
  const getCodeSystemFromValueSet = (valueSet: ValueSet): string | null => {
    if (valueSet.compose?.include && valueSet.compose.include.length > 0) {
      const firstInclude = valueSet.compose.include[0];
      return firstInclude.system || null;
    }
    return null;
  };

  /**
   * This function handles the change of the ValueSet selection.
   * @param valueSetUrl The URL of the ValueSet to load
   */
  const handleValueSetChange = async (valueSetUrl: string) => {
    setSelectedValueSet(valueSetUrl);
    setAvailableCodes([]);
    setSelectedCode("");
    setSelectedCodeSystem(null);
    // If a ValueSet URL is provided, fetch the codes
    if (valueSetUrl) {
      try {
        // Fetch the codes
        const codes = await valueSetLoader.searchValueSet(valueSetUrl);
        setAvailableCodes(codes);
        // Extract the CodeSystem URL from a ValueSet (first include only)
        const selectedValueSetResource = valueSets.find(
          (vs) => vs.url === valueSetUrl
        );
        setSelectedCodeSystem(
          selectedValueSetResource
            ? getCodeSystemFromValueSet(selectedValueSetResource)
            : null
        );
      } catch (error) {
        console.error("Error loading codes:", error);
        setAvailableCodes([]);
      }
    }
    // Update the parent component with the new ValueSet URL
    onChange({
      ...value,
      valueSetUrl: valueSetUrl,
      value: "",
    });
    validateField("criteriaValueSet", valueSetUrl, true);
  };

  /**
   * Function to handle code selection
   * @param codeValue The selected code value
   */
  const handleCodeSelection = (codeValue: string) => {
    setSelectedCode(codeValue);
    // Check if CodeSystem is available
    if (!selectedCodeSystem) {
      console.error("Cannot determine CodeSystem URL from ValueSet");
      return;
    }
    // Create the coding value object
    const codingValue = {
      system: selectedCodeSystem,
      code: codeValue,
    };
    // Update the parent component
    onChange({
      ...value,
      value: codingValue,
      valueSetUrl: selectedValueSet,
    });
    validateField("criteriaCode", codeValue, true);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <>
      {/* ValueSet Selection */}
      {!readonly && (
        <Form.Group className="mb-2">
          <Form.Label>{i18n.t("label.valueset")} *</Form.Label>
          <Form.Select
            value={selectedValueSet}
            onChange={(e) => handleValueSetChange(e.target.value)}
            isInvalid={!!errors?.criteriaValueSet}
            disabled={readonly}
          >
            <option value="">{i18n.t("placeholder.valueset")}</option>
            {valueSets.map((vs) => (
              <option key={vs.url} value={vs.url} title={vs.description}>
                {vs.name || vs.url}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors?.criteriaValueSet}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      {/* Code Selection */}
      <Form.Group className="mb-2">
        {availableCodes.length === 0 ? (
          <Alert variant="warning" className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {i18n.t("errormessage.nocodesavailable")}
          </Alert>
        ) : (
          <>
            <Form.Label>Code *</Form.Label>
            <Form.Select
              value={selectedCode}
              onChange={(e) => handleCodeSelection(e.target.value)}
              isInvalid={!!errors?.criteriaCode}
              disabled={readonly}
            >
              <option value="">{i18n.t("placeholder.selectcode")}</option>
              {availableCodes.map((code) => (
                <option key={code.code} value={code.code}>
                  {code.display || code.code}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors?.criteriaCode}
            </Form.Control.Feedback>
          </>
          // TODO : Do the multiple codes selection
          // TODO : Allow user to add codes (free value)
        )}
      </Form.Group>
    </>
  );
};

export default CodingParameter;
