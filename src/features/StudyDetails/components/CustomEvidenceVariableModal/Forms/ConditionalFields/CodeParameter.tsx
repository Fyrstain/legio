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
import { useComparators } from "../../../../hooks/useComparators";
import { ValidationErrors } from "../../../../hooks/useFormValidation";

/**
 * Component for handling code parameters in inclusion criteria.
 *
 * @param value - The current InclusionCriteriaValue object
 * @param onChange - Callback function to handle changes to the value
 * @param errors - Optional errors object for validation messages
 * @returns JSX.Element representing the code parameter form
 */
const CodeParameter: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
  errors?: ValidationErrors;
  validateField: (field: string, value: any, isRequired?: boolean) => void;
}> = ({ value, onChange, errors, validateField }) => {
  ////////////////////////////////
  //           Hooks            //
  ////////////////////////////////

  const { comparatorOptions, error } = useComparators("code");

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

  const [valueSets, setValueSets] = useState<ValueSet[]>([]);
  const [selectedValueSet, setSelectedValueSet] = useState<string>("");
  const [availableCodes, setAvailableCodes] = useState<SimpleCode[]>([]);
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

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * This function handles the change of the ValueSet selection.
   * @param valueSetUrl The URL of the ValueSet to load
   */
  const handleValueSetChange = async (valueSetUrl: string) => {
    setSelectedValueSet(valueSetUrl);
    setSelectedCode("");
    setAvailableCodes([]);
    // If a ValueSet URL is provided, fetch the codes or set to empty if not available
    if (valueSetUrl) {
      try {
        const codes = await valueSetLoader.searchValueSet(valueSetUrl);
        setAvailableCodes(codes);
      } catch (error) {
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
    // Update the parent component
    onChange({
      ...value,
      value: codeValue,
      valueSetUrl: selectedValueSet,
    });
    validateField("criteriaCode", codeValue, true);
  };

  /**
   * Function to handle changes in the operator select input
   * @param event - The change event from the select input
   */
  const handleOperatorChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    onChange({
      ...value,
      operator: event.target.value,
      value: undefined,
    });
    validateField("criteriaOperator", event.target.value, true);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <>
      {/* Operator Selection */}
      <Form.Group className="mb-2">
        <Form.Label>{i18n.t("label.comparisonoperator")} *</Form.Label>
        {error ? (
          <Alert variant="warning" className="mb-2">
            {i18n.t("error.loadingcomparators")} {error}
          </Alert>
        ) : (
          <>
            <Form.Select
              value={value.operator || ""}
              onChange={handleOperatorChange}
              isInvalid={!!errors?.criteriaOperator}
            >
              <option value="">{i18n.t("placeholder.logicaloperator")}</option>
              {comparatorOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.display || option.code}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors?.criteriaOperator}
            </Form.Control.Feedback>
          </>
        )}
      </Form.Group>

      {/* ValueSet Selection */}
      <Form.Group className="mb-2">
        <Form.Label>{i18n.t("label.valueset")} *</Form.Label>
        <Form.Select
          value={selectedValueSet}
          onChange={(e) => handleValueSetChange(e.target.value)}
          isInvalid={!!errors?.criteriaValueSet}
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

      {/* Code Selection */}
      {selectedValueSet && (
        <Form.Group className="mb-2">
          {availableCodes.length === 0 ? (
            <Alert
              variant="warning"
              className="d-flex align-items-center gap-2"
            >
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
      )}
    </>
  );
};

export default CodeParameter;
