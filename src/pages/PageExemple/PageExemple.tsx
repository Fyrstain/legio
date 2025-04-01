// React
import { FunctionComponent } from "react";
// Components
import ApplicationPage from "../../components/ApplicationPage/ApplicationPage";

const PageExemple: FunctionComponent = () => {
    return (
        <ApplicationPage titleKey='title.page' loading={false} fitFooter={true} needsLogin={true}>
            <>
                Add content here
            </>
        </ApplicationPage>
    );
};

export default PageExemple;
