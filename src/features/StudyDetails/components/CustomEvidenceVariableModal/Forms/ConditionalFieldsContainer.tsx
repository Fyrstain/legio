//React
import { FunctionComponent } from "react";
// Components
import BooleanParameter from "./ConditionalFields/BooleanParameter";
import IntegerParameter from "./ConditionalFields/IntegerParameter";
import DateTimeParameter from "./ConditionalFields/DateTimeParameter";
import CodingParameter from "./ConditionalFields/CodingParameter";
import StringParameter from "./ConditionalFields/StringParameter";
// Types
import { InclusionCriteriaValue } from "../../../types/evidenceVariable.types";
// Hooks
import { ValidationErrors } from "../../../hooks/useFormValidation";

const ConditionalFieldsContainer: FunctionComponent<{
  value: InclusionCriteriaValue;
  onChange: (value: InclusionCriteriaValue) => void;
  errors?: ValidationErrors;
  validateField: (field: string, value: any, isRequired?: boolean) => void;
  readonly?: boolean;
}> = ({ value, onChange, errors, validateField, readonly = false }) => {
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
        return (
          <BooleanParameter
            value={value}
            onChange={readonly ? () => {} : onChange}
            readonly={readonly}
          />
        );
      case "integer":
        return (
          <IntegerParameter
            value={value}
            onChange={readonly ? () => {} : onChange}
            readonly={readonly}
            errors={errors}
            validateField={validateField}
          />
        );
      case "datetime":
        return (
          <DateTimeParameter
            value={value}
            onChange={readonly ? () => {} : onChange}
            readonly={readonly}
            errors={errors}
            validateField={validateField}
          />
        );
      case "coding":
        return (
          <CodingParameter
            value={value}
            onChange={readonly ? () => {} : onChange}
            readonly={readonly}
            errors={errors}
            validateField={validateField}
          />
        );
      case "string":
        return (
          <StringParameter
            value={value}
            onChange={readonly ? () => {} : onChange}
            readonly={readonly}
            errors={errors}
            validateField={validateField}
          />
        );
      default:
        return null;
    }
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return <>{renderConditionalField()}</>;
};

export default ConditionalFieldsContainer;
