// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Card, Form, Row, Col } from "react-bootstrap";
// Translation
import i18n from "i18next";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
// HL7 Front library
import { FhirStatus, StatusTag, Title } from "@fyrstain/hl7-front-library";
// Fhir Front Library
import { StatusSelect } from "@fyrstain/fhir-front-library";
// Style
import "./InformationSection.css";

////////////////////////////////
//           Props            //
////////////////////////////////

interface FieldConfig {
  label: string;
  value: any;
  type?: "status" | "text" | "textarea" | "select" | "list" | "select-list";
  isEditable?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: any;
  options?: { value: string; label: string }[];
  placeholder?: string;
  onChange?: (value: any) => void;
}

export interface InformationSectionProps {
  fields: FieldConfig[];
  isEditing?: boolean;
}

//////////////////////////////////
//             Type             //
//////////////////////////////////

// Links the TestScript status to a display type for the dropdown
type StatusMenu = {
  status:
    | "success"
    | "suspended"
    | "errorStatus"
    | "advisory"
    | "info"
    | "unknown";
  statusMessage: string;
};

const InformationSection: FunctionComponent<InformationSectionProps> = ({
  fields,
  isEditing = false,
}) => {
  //////////////////////////////////
  //            Options           //
  //////////////////////////////////

  // Options for the status select
  // TODO Use a valueSet
  const statusOptions: StatusMenu[] = [
    { status: "advisory", statusMessage: "draft" },
    { status: "success", statusMessage: "active" },
    { status: "errorStatus", statusMessage: "retired" },
    { status: "unknown", statusMessage: "unknown" },
  ];

  //////////////////////////////////
  //            Actions           //
  //////////////////////////////////

  /**
   * Add an item to a select-list field
   */
  const addSelectListItem = (field: FieldConfig) => {
    const currentValues = Array.isArray(field.value) ? field.value : [];
    const usedValues = currentValues.filter((val) => val !== "");
    const availableOptions =
      field.options?.filter((option) => !usedValues.includes(option.value)) ||
      [];
    if (availableOptions.length > 0) {
      const newValues = [...currentValues, ""];
      field.onChange?.(newValues);
    }
  };

  /**
   * Remove an item from a select-list field
   *
   * @param field The field configuration
   * @param index The index of the item to remove
   */
  const removeSelectListItem = (field: FieldConfig, index: number) => {
    const currentValues = Array.isArray(field.value) ? field.value : [];
    const newValues = currentValues.filter((_, i) => i !== index);
    field.onChange?.(newValues);
  };

  /**
   * Update an item in a select-list field
   *
   * @param field The field configuration
   * @param index The index of the item to update
   * @param newValue The new value to set
   */
  const updateSelectListItem = (
    field: FieldConfig,
    index: number,
    newValue: string
  ) => {
    const currentValues = Array.isArray(field.value) ? field.value : [];
    const newValues = [...currentValues];
    newValues[index] = newValue;
    field.onChange?.(newValues);
  };

  /**
   * Renders a read-only field based on the field configuration
   *
   * @param field The field configuration
   * @param index The index of the field
   * @returns The rendered read-only field
   */
  const renderReadOnlyField = (field: FieldConfig, index: number) => (
    <div key={index}>
      {field.type !== "status" && field.type !== "list" && (
        <div className="gap-2">
          <Form.Label className="fw-semibold me-2 mb-0">
            {field.label} :
          </Form.Label>
          <Form.Text className="mt-0">{field.value}</Form.Text>
        </div>
      )}
      {field.type === "status" && (
        <div className="d-flex gap-2">
          <Form.Label className="fw-bold mb-0">{field.label} :</Form.Label>
          <Form.Text className="mt-0">
            <StatusTag
              flavor={FhirStatus[field.value as keyof typeof FhirStatus]}
              message={field.value}
            />
          </Form.Text>
        </div>
      )}
      {field.type === "list" && (
        <div className="gap-2">
          <Form.Label className="fw-semibold me-2 mb-0">
            {field.label} :
          </Form.Label>
          <Form.Text className="mt-0">
            {Array.isArray(field.value) && field.value.length > 0 ? (
              <ul className="mb-0">
                {field.value.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            ) : (
              "N/A"
            )}
          </Form.Text>
        </div>
      )}
    </div>
  );

  /**
   * Function to find the status field in the provided fields array
   */
  const statusField = fields.find((field) => field.type === "status");

  /**
   * Renders the editable field for the status on the header of the card
   *
   * @param field The field configuration for the status field
   * @returns The rendered editable field for the status
   */
  const renderEditableFieldOnHeader = (field: FieldConfig) => {
    if (field.type === "status") {
      const defaultSelectStatusOption =
        !field.value || field.value === "N/A"
          ? i18n.t("placeholder.choosestatus") || "Choisir un statut"
          : field.value;
      // Handle the change of status
      const handleStatusChange = (statusMessage: string) => {
        if (statusMessage !== i18n.t("placeholder.choosestatus")) {
          field.onChange?.(statusMessage);
        }
      };
      // Render the StatusSelect component with the status options
      return (
        <StatusSelect
          defaultSelectOption={defaultSelectStatusOption}
          statusMessageArray={statusOptions}
          onChange={handleStatusChange}
          language={i18n.t}
          updateTypeTranslation={""}
        />
      );
    }
  };

  /**
   * Renders an editable field based on the field configuration
   *
   * @param field The field configuration
   * @param index The index of the field
   * @returns The rendered editable field
   */
  const renderEditableField = (field: FieldConfig, index: number) => {
    const isInvalid =
      field.isInvalid !== undefined
        ? field.isInvalid
        : field.isRequired && (!field.value || field.value.trim() === "");
    const isFieldEditable = field.isEditable !== false;
    if (!isFieldEditable) {
      return (
        <Form.Group key={index} className="mb-3">
          <Form.Label className="fw-semibold">{field.label} :</Form.Label>
          <Form.Control
            type="text"
            value={field.value || ""}
            disabled
            readOnly
          />
        </Form.Group>
      );
    }
    // To avoid rendering the status field in the editable section, it's already rendered in the header
    if (field.type === "status") {
      return null;
    }
    // Handle list type fields
    if (field.type === "select-list") {
      return renderSelectListField(field, index);
    }
    // Render the editable field based on its type
    return (
      <Form.Group key={index} className="mb-3">
        <Form.Label className="fw-semibold">{field.label} :</Form.Label>
        {field.type === "textarea" ? (
          <>
            <Form.Control
              as="textarea"
              rows={3}
              value={field.value || ""}
              onChange={(e) => field.onChange?.(e.target.value)}
              placeholder={field.placeholder}
              isInvalid={isInvalid}
            />
            {isInvalid && (
              <Form.Control.Feedback type="invalid">
                {field.errorMessage}
              </Form.Control.Feedback>
            )}
          </>
        ) : (
          <>
            <Form.Control
              type="text"
              value={field.value || ""}
              onChange={(e) => field.onChange?.(e.target.value)}
              placeholder={field.placeholder}
              isInvalid={isInvalid}
            />
            {isInvalid && (
              <Form.Control.Feedback type="invalid">
                {field.errorMessage}
              </Form.Control.Feedback>
            )}
          </>
        )}
      </Form.Group>
    );
  };

  /**
   * Render a select-list field with add/remove functionality for predefined options
   *
   * @param field The field configuration for the select-list
   * @param index The index of the field
   * @returns The rendered select-list field
   */
  const renderSelectListField = (field: FieldConfig, index: number) => {
    // Ensure the field value is an array
    const listValues = Array.isArray(field.value) ? field.value : [];
    return (
      <Form.Group key={index} className="mb-3">
        <Form.Label className="fw-semibold">{field.label} :</Form.Label>
        {listValues.map((value, itemIndex) => {
          // Filter out used values to avoid duplicates in the dropdown
          const usedValues = listValues.filter(
            (val, index) => val !== "" && index !== itemIndex
          );
          const availableOptions =
            field.options?.filter(
              (option) => !usedValues.includes(option.value)
            ) || [];
          return (
            <Form.Group key={`${index}-${itemIndex}`} className="mb-2">
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  as="select"
                  value={value || ""}
                  onChange={(e) =>
                    updateSelectListItem(field, itemIndex, e.target.value)
                  }
                >
                  <option value="">
                    {i18n.t("placeholder.selectstudydesign")}
                  </option>
                  {value &&
                    field.options?.find((opt) => opt.value === value) && (
                      <option key={value} value={value}>
                        {
                          field.options.find((opt) => opt.value === value)
                            ?.label
                        }
                      </option>
                    )}
                  {/* Available options (excluding the current value to avoid duplicates) */}
                  {availableOptions
                    // Avoid the current value in the dropdown
                    .filter((option) => option.value !== value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </Form.Control>
                {/* Add a remove button if there are multiple items */}
                {listValues.length > 1 && (
                  <FontAwesomeIcon
                    size="lg"
                    className="repeat-cross"
                    onClick={() => removeSelectListItem(field, itemIndex)}
                    icon={faXmark}
                    title={i18n.t("button.remove")}
                  />
                )}
              </div>
              {/* Button to add new item only if there are available options */}
              {itemIndex === listValues.length - 1 &&
                (() => {
                  const usedValues = listValues.filter((val) => val !== "");
                  const remainingOptions =
                    field.options?.filter(
                      (option) => !usedValues.includes(option.value)
                    ) || [];
                  return remainingOptions.length > 0;
                })() && (
                  <div
                    className="mt-2 repeat-add"
                    onClick={() => addSelectListItem(field)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    {i18n.t("button.add")}
                  </div>
                )}
            </Form.Group>
          );
        })}
      </Form.Group>
    );
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <div className="d-flex flex-column gap-4 mb-4">
      <Card>
        <Card.Header className="d-flex justify-content align-items-center gap-4">
          <Title level={2} content="Informations" />
          {isEditing && statusField && renderEditableFieldOnHeader(statusField)}
        </Card.Header>
        <Card.Body className="d-flex gap-2 flex-column">
          {isEditing ? (
            <Form>
              <Row>
                {fields
                  .map((field, index) => ({
                    field,
                    index,
                    renderedField: renderEditableField(field, index),
                  }))
                  .filter(({ renderedField }) => renderedField !== null)
                  .map(({ field, index, renderedField }) => {
                    if (
                      field.type === "textarea" ||
                      field.type === "select-list"
                    ) {
                      return (
                        <Col xs={12} key={index}>
                          {renderedField}
                        </Col>
                      );
                    }
                    return (
                      <Col md={6} key={index}>
                        {renderedField}
                      </Col>
                    );
                  })}
              </Row>
            </Form>
          ) : (
            fields.map((field, index) => renderReadOnlyField(field, index))
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default InformationSection;