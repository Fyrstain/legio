// React
import { FunctionComponent, ReactNode } from "react";
// React Bootstrap
import { Modal, Button } from "react-bootstrap";
// Translation
import i18n from "i18next";
// HL7 Front library
import { Title } from "@fyrstain/hl7-front-library";

////////////////////////////////
//           Props            //
////////////////////////////////

interface BaseModalWrapperProps {
  // Modal visibility
  show: boolean;
  // Close handler
  onHide: () => void;
  // Save handler
  onSave: () => void;
  // Reset handler
  onReset: () => void;
  // Modal title
  title: string;
  // Content to display in modal body
  children: ReactNode;
  // Custom close handler
  onClose?: () => void;
}

const BaseModalWrapper: FunctionComponent<BaseModalWrapperProps> = (props: BaseModalWrapperProps) => {
  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Handle modal close - use custom handler if provided, otherwise use onHide
   */
  const handleClose = () => {
    if (props.onClose) {
      props.onClose();
    } else {
      props.onHide();
    }
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Modal show={props.show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Title level={2} content={props.title} />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>{props.children}</Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={props.onSave}>
          {i18n.t("button.save")}
        </Button>
        <Button variant="secondary" onClick={props.onReset}>
          {i18n.t("button.reset")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BaseModalWrapper;
