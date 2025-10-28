import { FunctionComponent } from "react";
import i18n from "i18next";

interface Props {
  onAdd: () => void;
  fullWidth?: boolean;
}

/**
 * AddInstanceCard component.
 */
const AddInstanceCard: FunctionComponent<Props> = ({ onAdd, fullWidth }) => {
  return (
    <button
      type="button"
      className={`add-instance-card ${fullWidth ? "add-instance-card-full" : ""}`}
      onClick={onAdd}
      aria-label={i18n.t("button.createInstance") ?? "Create new instance"}
    >
      <div className="add-instance-inner">
        <div className="add-instance-icon">+</div>
        <p className="add-instance-label">
          {i18n.t("button.createInstance") ?? "Create instance"}
        </p>
      </div>
    </button>
  );
};

export default AddInstanceCard;
