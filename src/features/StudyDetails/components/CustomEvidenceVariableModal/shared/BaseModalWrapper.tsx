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
  // Whether save button should be enabled
  isSaveEnabled: boolean;
  // Modal size
  size?: "sm" | "lg" | "xl";
  // Custom close handler
  onClose?: () => void;
}

const BaseModalWrapper: FunctionComponent<BaseModalWrapperProps> = ({
  show,
  onHide,
  onSave,
  onReset,
  title,
  children,
  isSaveEnabled,
  size = "lg",
  onClose,
}) => {
  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Handle modal close - use custom handler if provided, otherwise use onHide
   */
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      onHide();
    }
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <Modal show={show} onHide={handleClose} size={size} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Title level={2} content={title} />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>{children}</Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={onSave} disabled={!isSaveEnabled}>
          {i18n.t("button.save")}
        </Button>
        <Button variant="secondary" onClick={onReset}>
          {i18n.t("button.reset")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BaseModalWrapper;