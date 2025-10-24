import { FunctionComponent } from "react";
import i18n from "i18next";

/**
 * Card allowing the user to create a new study instance.  It displays a
 * large plus symbol and label.  When clicked, it calls the provided
 * handler.  This component does not handle the instantiation itself.
 */
interface Props {
  onAdd: () => void;
  fullWidth?: boolean;
}

const AddInstanceCard: FunctionComponent<Props> = ({ onAdd, fullWidth }) => {
  return (
    <div
      className={`add-instance-card ${fullWidth ? "add-instance-card-full" : ""}`}
      onClick={onAdd}
      role="button"
      tabIndex={0}
      aria-label={i18n.t("button.createInstance") ?? "Create new instance"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onAdd();
        }
      }}
    >
      <div className="add-instance-icon">+</div>
      <p className="add-instance-label">
        {i18n.t("button.createInstance") ?? "Create instance"}
      </p>
    </div>
  );
};

export default AddInstanceCard;