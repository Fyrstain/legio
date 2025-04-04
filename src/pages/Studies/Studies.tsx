// React
import { FunctionComponent } from "react";
// Components
import LegioPage from "../../components/LegioPage/LegioPage";

const Studies: FunctionComponent = () => {
    return (
        <LegioPage titleKey='title.studies' loading={false} fitFooter={true} needsLogin={false}>
            <>
                Add content here
            </>
        </LegioPage>
    );
};

export default Studies;
