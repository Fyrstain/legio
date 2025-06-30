//React
import { FunctionComponent, useState } from "react";
// Components
import { InclusionCriteriaValue } from "../../../types/evidenceVariable.types";
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

const CodeField: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
}> = ({ value, onChange }) => {

  /////////////////////////////////////
  //             Client              //
  /////////////////////////////////////

  // FHIR Client for ValueSet operations
  const fhirClient = new Client({
    baseUrl: process.env.REACT_APP_TERMINOLOGY_URL ?? "fhir",
  });

  const valueSetLoader = new ValueSetLoader(fhirClient);

  // TODO : Remove later, it's to test the component
  const commonValueSets = [
    {
      url: "https://www.centreantoinelacassagne.org/ValueSet/VS-ResearchStudyPhase",
      name: "Research Study Phase",
    },
    {
      url: "http://hl7.org/fhir/ValueSet/study-design",
      name: "Study Design",
    },
    {
      url: "http://snomed.info/sct/ValueSet/disorders",
      name: "SNOMED CT Disorders",
    },
  ];

  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  const [selectedValueSet, setSelectedValueSet] = useState<string>("");
  const [availableCodes, setAvailableCodes] = useState<SimpleCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");

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
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <>
      {/* ValueSet Selection */}
      <Form.Group className="mb-2">
        <Form.Label>ValueSet</Form.Label>
        <Form.Select
          value={selectedValueSet}
          onChange={(e) => handleValueSetChange(e.target.value)}
        >
          <option value="">{i18n.t("placeholder.valueset")}</option>
          {commonValueSets.map((vs) => (
            <option key={vs.url} value={vs.url}>
              {vs.name}
            </option>
          ))}
        </Form.Select>
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
              <Form.Label>Code</Form.Label>
              <Form.Select
                value={selectedCode}
                onChange={(e) => handleCodeSelection(e.target.value)}
              >
                <option value="">{i18n.t("placeholder.selectcode")}</option>
                {availableCodes.map((code) => (
                  <option key={code.code} value={code.code}>
                    {code.display || code.code}
                  </option>
                ))}
              </Form.Select>
            </>
          )}
        </Form.Group>
      )}
    </>
  );
};

export default CodeField;
