// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Form } from "react-bootstrap";

////////////////////////////////
//           Props            //
////////////////////////////////

interface FieldErrorProps {
  error?: string;
  show?: boolean;
}

const FieldError: FunctionComponent<FieldErrorProps> = ({
  error,
  show = true,
}) => {
  if (!error || !show) {
    return null;
  }

  return (
    <Form.Text className="text-danger d-flex align-items-center mt-1">
      {error}
    </Form.Text>
  );
};

export default FieldError;
