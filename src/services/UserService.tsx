// Keycloak
// import Keycloak, {
//   KeycloakFlow,
//   KeycloakOnLoad,
//   KeycloakPkceMethod,
// } from "keycloak-js";

// Keycloak configuration
// const keycloakConfig = {
//   url: process.env.REACT_APP_KEYCLOAK_URL as string,
//   realm: process.env.REACT_APP_KEYCLOAK_REALM as string,
//   clientId: process.env.REACT_APP_KEYCLOAK_REALM_CLIENT_ID as string,
// };

// Keycloak instance
// const keycloak = new Keycloak(keycloakConfig);

///////////////////////////////
//        functions          //
///////////////////////////////

/**
 * To be used when Keycloak is not used in the application.
 *
 */
const initKeycloak = (onAuthenticatedCallback: any) => {
  onAuthenticatedCallback();
};

const doLogin = () => {};

const doLogout = () => {};

const getToken = () => null;

const getTokenParsed = () => null;

const isAuthenticated = () => false;

const getUsername = () => "";

const hasRole = () => false;

const getKC = () => ({
  token: null,
});

const updateToken = (successCallback: () => any) => {
  successCallback();
  return Promise.resolve(true);
};

// /**
//  * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
//  *
//  * @param onAuthenticatedCallback
//  */
// const initKeycloak = (onAuthenticatedCallback: any) => {
//   keycloak
//     .init({
//       onLoad: process.env.REACT_APP_KEYCLOAK_ONLOAD as KeycloakOnLoad,
//       silentCheckSsoRedirectUri:
//         window.location.origin + "/silent-check-sso.html",
//       pkceMethod: process.env
//         .REACT_APP_KEYCLOAK_PKCE_METHOD as KeycloakPkceMethod,
//       flow: process.env.REACT_APP_KEYCLOAK_FLOW as KeycloakFlow,
//       silentCheckSsoFallback: process.env
//         .REACT_APP_KEYCLOAK_CHECKSSO_FALLBACK as unknown as boolean,
//       checkLoginIframe: process.env
//         .REACT_APP_KEYCLOAK_CHECKSSO_LOGIN_IFRAME as unknown as boolean,
//     })
//     .then(() => {
//       const postLoginRedirectUri = localStorage.getItem("postLoginRedirectUri");
//       if (postLoginRedirectUri) {
//         window.location.href = postLoginRedirectUri;
//         localStorage.removeItem("postLoginRedirectUri");
//       } else {
//         onAuthenticatedCallback();
//       }
//     })
//     .catch(console.error);
// };

// /**
//  * Redirects to Keycloak login page and sets the redirectUri to the current window location
//  *
//  * @returns Promise<void>
//  */
// const doLogin = (): Promise<void> => {
//   return keycloak.login({ redirectUri: window.location.origin });
// };

// /**
//  * Redirects to Keycloak logout page and sets the redirectUri to the Home page
//  */
// const doLogout = () =>
//   keycloak.logout({ redirectUri: window.location.origin + "/Home" });

// /**
//  * Returns the token from the Keycloak instance
//  */
// const getToken = () => keycloak.token;

// /**
//  * Returns the parsed token from the Keycloak instance
//  */
// const getTokenParsed = () => keycloak.tokenParsed;

// /**
//  * Checks if the user is authenticated
//  */
// const isAuthenticated = (): boolean | undefined => {
//   return !!keycloak.token;
// };

// /**
//  * Returns the username from the Keycloak instance
//  */
// const getUsername = () => keycloak.tokenParsed?.preferred_username;

// /**
//  * Checks if the user has a role
//  *
//  * @param roles
//  */
// const hasRole = (roles: string[]) =>
//   roles.some((role: string) => keycloak.hasRealmRole(role));

// /**
//  * Returns the Keycloak instance
//  */
// const getKC = () => keycloak;

// /**
//  * Updates the token and calls the provided callback function if successfully authenticated.
//  *
//  * @param successCallback
//  */
// const updateToken = (successCallback: () => any) =>
//   keycloak.updateToken(300).then(successCallback).catch(doLogin);

///////////////////////////////
//        exports            //
///////////////////////////////

const UserService = {
  initKeycloak,
  doLogin,
  doLogout,
  isAuthenticated,
  getToken,
  getTokenParsed,
  updateToken,
  getUsername,
  hasRole,
  getKC,
};

export default UserService;
