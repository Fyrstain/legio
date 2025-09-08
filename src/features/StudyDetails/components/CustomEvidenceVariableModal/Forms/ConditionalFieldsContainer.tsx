//React
import { FunctionComponent } from "react";
// Components
import BooleanField from "./ConditionalFields/BooleanField";
import IntegerField from "./ConditionalFields/IntegerField";
import DateField from "./ConditionalFields/DateField";
import CodeField from "./ConditionalFields/CodeField";
// React Bootstrap
import { Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Types
import { InclusionCriteriaValue } from "../../../types/evidenceVariable.types";

const ConditionalFieldsContainer: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
  errors?: Record<string, string>;
}> = ({ value, onChange, errors }) => {
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
        return <BooleanField value={value} onChange={onChange} errors={errors} />;
      case "integer":
        return <IntegerField value={value} onChange={onChange} errors={errors} />;
      case "date":
        return <DateField value={value} onChange={onChange} errors={errors} />;
      case "code":
        return <CodeField value={value} onChange={onChange} errors={errors} />;
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
        <Form.Label>{i18n.t("label.parametertype")}</Form.Label>
        <Form.Control
          type="text"
          value={
            value.type
              ? i18n.t(`label.${value.type}`)
              : i18n.t(`label.filltheotherfields`)
          }
          disabled
          readOnly
        />
      </Form.Group>
      {renderConditionalField()}
    </>
  );
};

export default ConditionalFieldsContainer;
