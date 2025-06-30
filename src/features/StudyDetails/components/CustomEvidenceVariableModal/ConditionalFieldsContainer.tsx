//React
import { FunctionComponent } from "react";
// Components
import {
  InclusionCriteriaTypes,
  InclusionCriteriaValue,
} from "../../types/evidenceVariable.types";
// React Bootstrap
import { Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Conditional Fields
import IntegerField from "./ConditionalFields/IntegerField";
import BooleanField from "./ConditionalFields/BooleanField";
import DateField from "./ConditionalFields/DateField";
import CodeField from "./ConditionalFields/CodeField";

const ConditionalFieldsContainer: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
}> = ({ value, onChange }) => {
    
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  /**
   * Constant for the inclusion criteria types
   */
  const inclusionCriteriaTypes: InclusionCriteriaTypes[] = [
    "boolean",
    "integer",
    "date",
    "code",
  ];

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Function to render the appropriate conditional field based on the value type
   * @returns The rendered conditional field component
   */
  const renderConditionalField = () => {
    switch (value.type) {
      case "boolean":
        return <BooleanField value={value} onChange={onChange} />;
      case "integer":
        return <IntegerField value={value} onChange={onChange} />;
      case "date":
        return <DateField value={value} onChange={onChange} />;
      case "code":
        return <CodeField value={value} onChange={onChange} />;
      default:
        return null;
    }
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>{i18n.t("label.inclusioncriteriatype")}</Form.Label>
        <Form.Select
          value={value.type}
          onChange={(e) =>
            onChange({
              ...value,
              type: e.target.value as InclusionCriteriaTypes,
            })
          }
        >
          <option value="">{i18n.t("placeholder.selectcriteriatype")}</option>
          {inclusionCriteriaTypes.map((type) => (
            <option key={type} value={type}>
              {i18n.t(`label.${type}`)}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      {renderConditionalField()}
    </>
  );
};

export default ConditionalFieldsContainer;
