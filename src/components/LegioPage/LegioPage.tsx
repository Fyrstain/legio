// React
import { FunctionComponent, JSXElementConstructor, ReactElement } from "react";
// Components
import { Page, PageConfiguration } from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";
// Authentication
// import UserService from "../../services/UserService";

const LegioPage: FunctionComponent<{
    // The title of the page
    titleKey?: string;
    // The action of the title 
    pageAction?: ReactElement; 
    // The loading state of the page
    loading?: boolean;
    // The content of the page
    children?: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
    // Fit the footer to the bottom of the page
    fitFooter?: boolean;
    // If the page needs login or not
    needsLogin?: boolean;
    }> = (props) => {

    /////////////////////////////////
    //           METHODS           //
    /////////////////////////////////

    // /*
    // **
    // **  This function is used to handle the login of the user.
    // **  If the user is not logged in and the menu item needs login, it will redirect to the login page.
    // **
    // */
    // const handleLogin = useCallback((config: MenuItem) => {
    //     if (config.needsLogin) {
    //         if (!UserService.isAuthenticated()) {
    //             UserService.doLogin();
    //             navigate('/login');
    //         }
    //     }
    // }, [navigate]);

    const handleLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(event.target.value);
    };

    const fullConfig: PageConfiguration = {
        // Translation
        language: i18n.t,
        navigationBarConfigs: {
        // Legio logo
        logoLink: (process.env.PUBLIC_URL ?? "") + "/assets/Legiologo.png",
        alt: "Legio Logo",
        applicationItems: [
            {
              logoLink: process.env.REACT_APP_POLUS_LOGO ?? "",
              link: process.env.REACT_APP_POLUS_LOGO_LINK ?? "/",
              alt: "Polus Logo",
            },
            {
              logoLink: process.env.REACT_APP_SPHINX_LOGO ?? "",
              link: process.env.REACT_APP_SPHINX_LOGO_LINK ?? "/",
              alt: "Sphinx Logo",
            },
        ],
        // Authentication
        //   authentication: {
        //     handleLogin: handleLogin,
        //     token: UserService.getKC().token,
        //     doLogin: UserService.doLogin,
        //     doLogout: UserService.doLogout,
        //     isAuthenticated: () => UserService.isAuthenticated() || false,
        //     getUserName: () => UserService.getUsername(),
        //   },
        // the menu items with their subItems who contains the navigation to the differents pages
        menuItems: [
            {
            title: i18n.t("navbar.items.studies"),
            link: (process.env.PUBLIC_URL ?? "") + "/Studies",
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
        dropDownItems: [
            {
            title: "Admin",
            link: (process.env.PUBLIC_URL ?? "") + "/InProgress",
            },
        ],
        // customItems: <ServerUrlField />
        },
        // the title of the page
        titleKey: props.titleKey,
        // the action of the title
        pageAction: props.pageAction,
        // the loading state of the page
        loading: props.loading,
        // the content of the page
        children: props.children,
        // if the page needs login or not
        needsLogin: false, // props.needsLogin,
        footerConfigs: {
        languages: {
            default: i18n.language,
            onChange: handleLangChange,
            options: [
            {
                label: "English",
                value: "en",
            },
            {
                label: "Français",
                value: "fr",
            },
            ],
        },
        logo: [
            ...(process.env.REACT_APP_CLIENT_LOGO
            ? [
                {
                    logoLink: process.env.REACT_APP_CLIENT_LOGO,
                    alt: "Horizontal logo type",
                    link: (process.env.REACT_APP_CLIENT_LOGO_LINK ?? "/"),
                },
                ]
            : [
                {
                    logoLink:
                        "https://fyrstain.com/wp-content/uploads/2022/10/Logo_fyrstain_horyzontal.svg",
                    alt: "Horizontal logo type",
                    link: "https://fyrstain.com",
                }
            ]),
        ],
        // TODO : Uncomment the items when the footer is ready
        items: [
            // {
            //   label: i18n.t("footer.items.about"),
            //   link: (process.env.PUBLIC_URL ?? "") + "/InProgress",
            // },
            // {
            //   label: i18n.t("footer.items.contact"),
            //   link: (process.env.PUBLIC_URL ?? "") + "/InProgress",
            // },
            // {
            //   label: i18n.t("footer.items.problemtracking"),
            //   link: (process.env.PUBLIC_URL ?? "") + "/InProgress",
            // },
        ],
        },
    };

    return <Page {...fullConfig} />;
};

export default LegioPage;
