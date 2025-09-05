// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Card, Form } from "react-bootstrap";
// Translation
import i18n from "i18next";

////////////////////////////////
//           Props            //
////////////////////////////////

interface ExcludeCardProps {
  // Value of the exclude field
  exclude: boolean;
  // Callback called on change
  onChange: (exclude: boolean) => void;
}

const ExcludeCard: FunctionComponent<ExcludeCardProps> = ({
  exclude,
  onChange,
}) => {
  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Handle inclusion/exclusion radio change
   */
  const handleInclusionExclusionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isExcluded = e.target.value === "exclusion";
    onChange(isExcluded);
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">
          {i18n.t("title.characteristicinclusion")}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>{i18n.t("label.criteriatype")}</Form.Label>
          <div className="mt-2">
            {/* The check for inclusion*/}
            <Form.Check
              inline
              type="radio"
              name="inclusionExclusion"
              id="inclusion-radio"
              label="Inclusion"
              value="inclusion"
              checked={!exclude}
              onChange={handleInclusionExclusionChange}
            />
            {/* The check for exclusion */}
            <Form.Check
              inline
              type="radio"
              name="inclusionExclusion"
              id="exclusion-radio"
              label="Exclusion"
              value="exclusion"
              checked={exclude}
              onChange={handleInclusionExclusionChange}
            />
          </div>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default ExcludeCard;