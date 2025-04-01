// React
import { FunctionComponent } from "react";
// Library
import { Title } from "@fyrstain/fhir-front-library";
// Components
import ApplicationPage from "../../components/ApplicationPage/ApplicationPage";
// Styles
import styles from "./Home.module.css";

const Home: FunctionComponent = () => {
    return (
        <ApplicationPage loading={false} fitFooter={true} needsLogin={false}>
            <>
                <div className={styles.mainHomeContainer}>
                    <img
                        className={styles.homeimageIcon}
                        alt="Home_image"
                        src="/assets/home.jpg"
                    />
                    <Title level={1} prefix={'Application'} />
                </div>
            </>
        </ApplicationPage>
    );
};

export default Home;
