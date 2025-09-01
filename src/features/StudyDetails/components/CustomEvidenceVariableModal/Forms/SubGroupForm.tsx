// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Form, Card } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Hook
import { useEvidenceVariableForm } from "../../../hooks/useEvidenceVariableForm";
// Components
import InclusionCriteriaForm from "./InclusionCriteriaForm";
// Types
import {
  EvidenceVariableFormType,
  EvidenceVariableProps,
  EvidenceVariableFormData,
  EvidenceVariableLogicType,
} from "../../../types/evidenceVariable.types";

////////////////////////////////
//           Props            //
////////////////////////////////

interface SubGroupFormProps {
  formType: EvidenceVariableFormType;
  initialEvidenceVariable?: EvidenceVariableProps;
  initialFormData?: EvidenceVariableFormData;
  logicType?: EvidenceVariableLogicType;
}

const SubGroupForm: FunctionComponent<SubGroupFormProps> = ({
  formType,
  initialEvidenceVariable,
  initialFormData,
  logicType,
}) => {

  // Use the existing hook for the subgroup description
  const { evidenceVariableData, handleCharacteristicDescriptionChange } =
    useEvidenceVariableForm(formType, initialEvidenceVariable, initialFormData);

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <>
      {/* First Card: Subgroup Description */}
      <Card className="mb-3">
        <Card.Header>
          <Card.Title>
            {i18n.t("title.subgroup")} {logicType}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Subgroup Description field (using the characteristicDescription state) */}
            <Form.Group className="mb-3">
              <Form.Label>{i18n.t("label.generaldescription")} *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={i18n.t("placeholder.subgroupdescription")}
                value={evidenceVariableData.characteristicDescription || ""}
                onChange={handleCharacteristicDescriptionChange}
                required
              />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      {/* Second Card: Reuse InclusionCriteriaForm component*/}
      <InclusionCriteriaForm
        formType="inclusionCriteria"
        initialEvidenceVariable={initialEvidenceVariable}
        initialFormData={initialFormData}
      />
    </>
  );
};

export default SubGroupForm;