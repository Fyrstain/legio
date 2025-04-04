// React
import { FunctionComponent } from "react";
// Library
import { Title } from "@fyrstain/hl7-front-library";
// Components
import LegioPage from "../../components/LegioPage/LegioPage";
// Translation
import i18n from "i18next";

const Home: FunctionComponent = () => {
    return (
        <LegioPage loading={false} fitFooter={true}>
            <>
                <div className='h-100 d-flex justify-content-center align-items-center flex-md-row flex-column gap-3'>
                    <div>
                        <img
                            className='home-image-icon'
                            alt='Home_image'
                            src={(process.env.PUBLIC_URL ?? '') + '/assets/home.png'}
                        />
                    </div>
                    <div>
                        <Title
                            level={1}
                            prefix='Legio'
                            content={i18n.t('title.cohortingdatamart')}
                        />
                    </div>
                </div>
            </>
        </LegioPage>
    );
};

export default Home;
