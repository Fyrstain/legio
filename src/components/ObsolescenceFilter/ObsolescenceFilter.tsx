// React
import { FunctionComponent } from "react";
// React Bootstrap
import { Dropdown, DropdownButton } from "react-bootstrap";
// Translation
import i18n from "i18next";
// Styles
import styles from "./ObsolescenceFilter.css";

////////////////////////////////
//         Interface          //
////////////////////////////////

interface ObsolescenceFilterProps {
  value: "obsolete" | "not-obsolete" | "all";
  onChange: (value: "obsolete" | "not-obsolete" | "all") => void;
}

////////////////////////////////
//           Props            //
////////////////////////////////

const ObsolescenceFilter: FunctionComponent<ObsolescenceFilterProps> = ({ value, onChange }) => {

  ////////////////////////////////
  //           Actions          //
  ////////////////////////////////

  /**
   * To prevent the dropdown from closing when clicking inside it.
   * This is necessary to allow the user to select an option without the dropdown closing immediately.
   * @param e is the mouse event triggered by clicking on the dropdown.
   */
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <div onClick={handleDropdownClick}>
      <DropdownButton
        id="dropdown-obsolescence-filter"
        title={i18n.t("button.filterobsolescence")}
        size="sm"
        variant="secondary"
        className={`ms-4 ${styles["dropdown-toggle"]}`}
      >
        <Dropdown.Item onClick={() => onChange("obsolete")}>
          {i18n.t("label.obsolete")}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => onChange("not-obsolete")}>
          {i18n.t("label.notobsolete")}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => onChange("all")}>
          {i18n.t("label.clearfilter")}
        </Dropdown.Item>
      </DropdownButton>
    </div>
  );
};

export default ObsolescenceFilter;
