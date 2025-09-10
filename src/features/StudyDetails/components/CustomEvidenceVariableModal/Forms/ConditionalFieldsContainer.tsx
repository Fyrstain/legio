//React
import { FunctionComponent } from "react";
// Components
import BooleanParameter from "./ConditionalFields/BooleanParameter";
import IntegerParameter from "./ConditionalFields/IntegerParameter";
import DateParameter from "./ConditionalFields/DateParameter";
import CodeParameter from "./ConditionalFields/CodeParameter";
// React Bootstrap
import { Form } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Types
import { InclusionCriteriaValue } from "../../../types/evidenceVariable.types";
// Hooks
import { ValidationErrors } from "../../../hooks/useFormValidation";

const ConditionalFieldsContainer: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
  errors?: ValidationErrors;
  validateField: (field: string, value: any, isRequired?: boolean) => void;
}> = ({ value, onChange, errors, validateField }) => {
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
        return <BooleanParameter value={value} onChange={onChange} errors={errors} validateField={validateField} />;
      case "integer":
        return <IntegerParameter value={value} onChange={onChange} errors={errors} validateField={validateField} />;
      case "date":
        return <DateParameter value={value} onChange={onChange} errors={errors} validateField={validateField} />;
      case "code":
        return <CodeParameter value={value} onChange={onChange} errors={errors} validateField={validateField} />;
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
