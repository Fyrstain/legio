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

const ObsolescenceFilter: FunctionComponent<ObsolescenceFilterProps> = (props: ObsolescenceFilterProps) => {

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

  /**
   * Configuration for filter options
   * This defines the available options for the obsolescence filter.
   */
    const filterOptions = [
      {
        value: "obsolete",
        label: i18n.t("label.obsolete"),
      },
      {
        value: "not-obsolete",
        label: i18n.t("label.notobsolete"),
      },
      {
        value: "all",
        label: i18n.t("label.clearfilter"),
      },
    ] as const;

  /**
   * Get the display title based on current value
   * This function returns the appropriate display title for the dropdown button
   * based on the currently selected filter option.
   */
  const getDisplayTitle = () => {
    if (props.value === "all") {
      return i18n.t("button.filterobsolescence");
    }
    const currentOption = filterOptions.find(
      (option) => option.value === props.value
    );
    return currentOption
      ? currentOption.label
      : i18n.t("button.filterobsolescence");
  };

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <div onClick={handleDropdownClick}>
      <DropdownButton
        id="dropdown-obsolescence-filter"
        title={getDisplayTitle()}
        size="sm"
        variant="secondary"
        className={styles["dropdown-toggle"]}
      >
        {filterOptions.map((option) => (
          <Dropdown.Item
            key={option.value}
            onClick={() => props.onChange(option.value)}
            active={props.value === option.value}
          >
            {option.label}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </div>
  );
};

export default ObsolescenceFilter;