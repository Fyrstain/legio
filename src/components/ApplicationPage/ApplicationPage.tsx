// React
import { FunctionComponent, JSXElementConstructor, ReactElement, useCallback } from "react";
// Components
import { Page, PageConfiguration } from "@fyrstain/fhir-front-library";
import { MenuItem } from "@fyrstain/fhir-front-library";
// Translation
import i18n from "i18next";
// Authentication
import UserService from "../../services/UserService";
// Navigation
import { useNavigate } from "react-router-dom";

const ApplicationPage: FunctionComponent<{
    // The title of the page
    titleKey?: string;
    // The loading state of the page
    loading?: boolean;
    // The content of the page
    children?: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
    // Fit the footer to the bottom of the page
    fitFooter?: boolean;
    // If the page needs login or not
    needsLogin: boolean;
}> = (props) => {

    /////////////////////////////////
    //        NAVIGATION           //
    /////////////////////////////////

    const navigate = useNavigate();

    /////////////////////////////////
    //           METHODS           //
    /////////////////////////////////

    /*
    **
    **  This function is used to handle the login of the user.
    **  If the user is not logged in and the menu item needs login, it will redirect to the login page.
    **
    */
    const handleLogin = useCallback((config: MenuItem) => {
        if (config.needsLogin) {
            if (!UserService.isAuthenticated()) {
                UserService.doLogin();
                navigate('/login');
            }
        }
    }, [navigate]);

    const handleLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(event.target.value);
    };

    const fullConfig: PageConfiguration = {
        // Translation
        language: i18n.t,
        navigationBarConfigs: {
            // Application logo
            homeLink: '/Home',
            logoLink: '/assets/logo.png',
            logoWidth: '3.5rem',
            alt: 'Application Logo',
            // Authentication            
            authentication: {
                handleLogin: handleLogin,
                token: UserService.getKC().token,
                doLogin: UserService.doLogin,
                doLogout: UserService.doLogout,
                isAuthenticated: () => UserService.isAuthenticated() || false,
                getUserName: () => UserService.getUsername(),
            },
            // the menu items with their subItems who contains the navigation to the differents pages
            menuItems: [
                {
                    title: i18n.t('navbar.items.page'),
                    link: '/Page',
                    needsLogin: true
                    // subItems: [
                    //     {
                    //         title: '',
                    //         link: '/'
                    //     }
                    // ]
                },
            ],
            // the user items 
            // Admin, Login, Logout are the default items
            dropDownItems: [],
            // customItems: <ServerUrlField />
        },
        // the title of the page
        titleKey: props.titleKey,
        // the loading state of the page
        loading: props.loading,
        // the content of the page
        children: props.children,
        // the footer of the page
        fitFooter: props.fitFooter,
        // if the page needs login or not
        needsLogin: props.needsLogin,
        footerConfigs: {
            languages: {
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
            },
            logo: [
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
            ],
            items: [
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
            ]
        }
    };

    return <Page {...fullConfig} />;
};

export default ApplicationPage;