//React
import { FunctionComponent, JSXElementConstructor, ReactElement, useEffect } from "react";
//Components
import { Footer, Main, NavigationBarConfig, NavigationBar, Title } from "@fyrstain/fhir-front-library";
//Translation
import i18n from "i18next";
//Styles
import styles from "./Page.module.css";
//Services
import UserService from "../../services/UserService";
//Date
import dayjs from "dayjs";
export interface PageConfiguration {
    // Navigation bar configurations
    navigationBarConfigs: NavigationBarConfig;
    // Page configurations
    // Name of the page
    titleKey?: string;
    // Loading state
    loading?: boolean;
    // Children if you want to add some elements in the content of the page
    children?: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
    // Fit the footer to the bottom of the page
    fitFooter?: boolean;
    // If we need to login to access the page
    needsLogin: boolean;
}

const Page: FunctionComponent<PageConfiguration> = (configs) => {

    useEffect(() => {
        if (configs.needsLogin && !UserService.isAuthenticated()) {
            UserService.doLogin();
        }
    }, [configs.needsLogin]);

    /** function to handle the language change
     * 
     * @param event 
     */
    const handleLangChange = ((event: any) => {
        i18n.changeLanguage(event.target.value);
        dayjs.locale(event.target.value);
    });

    //////////////////////////
    //        CONTENT       //
    //////////////////////////

    return <div>
        <NavigationBar {...configs.navigationBarConfigs} />
        {configs.titleKey &&
            <div className={styles.titleContainer}>
                <Title
                    level={1}
                    content={i18n.t(configs.titleKey)}
                />
            </div>
        }
        <Main loading={configs.loading}>
            {configs.children}
        </Main>
        <div className={configs.fitFooter || configs.loading ? 'footerContainer' : ''}>
            <Footer
                languages={{
                    default: i18n.language,
                    onChange: handleLangChange,
                    options: [
                        {
                            label: "English",
                            value: "en"
                        },
                        {
                            label: "Français",
                            value: "fr"
                        }
                    ]
                }}
                logo={
                    [
                        {
                            src: "https://fyrstain.com/wp-content/uploads/2022/10/Logo_fyrstain_horyzontal.svg",
                            alt: "Horizontal logo type",
                            href: "/Home"
                        },
                        ...(process.env.REACT_APP_DISPLAY_CLIENT_LOGO === 'true' ?
                            [
                                {
                                    src: "https://fyrstain.com/wp-content/uploads/2022/10/Logo_fyrstain_horyzontal.svg",
                                    alt: "Horizontal logo type",
                                    href: "/Home"
                                },
                                {
                                    src: "/assets/client_logo.jpg",
                                    alt: "HL7 Europe logo"
                                }
                            ]
                            : [])
                    ]}
                items={[
                    {
                        label: i18n.t('footer.items.about'),
                        href: "/"
                    },
                    {
                        label: i18n.t('footer.items.contact'),
                        href: "/"
                    },
                    {
                        label: i18n.t('footer.items.problemtracking'),
                        href: "/"
                    }
                ]}
            />
        </div>
    </div >;
};

export default Page;