import Keycloak, { KeycloakFlow, KeycloakOnLoad, KeycloakPkceMethod } from "keycloak-js";


const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL as string,
  realm: process.env.REACT_APP_KEYCLOAK_REALM as string,
  clientId: process.env.REACT_APP_KEYCLOAK_REALM_CLIENT_ID as string,
}

const keycloak = new Keycloak(keycloakConfig)

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

/** 
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
// const initKeycloak = (onAuthenticatedCallback: any) => {
//   keycloak.init({
//     onLoad: process.env.REACT_APP_KEYCLOAK_ONLOAD as KeycloakOnLoad,
//     silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
//     pkceMethod: process.env.REACT_APP_KEYCLOAK_PKCE_METHOD as KeycloakPkceMethod,
//     flow: process.env.REACT_APP_KEYCLOAK_FLOW as KeycloakFlow,
//     silentCheckSsoFallback: process.env.REACT_APP_KEYCLOAK_CHECKSSO_FALLBACK as unknown as boolean,
//     checkLoginIframe: process.env.REACT_APP_KEYCLOAK_CHECKSSO_LOGIN_IFRAME as unknown as boolean,
//   })
//     .then(() => {
//       onAuthenticatedCallback();
//     })
//     .catch(console.error);
// };

// const doLogin = keycloak.login;

// const doLogout = () => keycloak.logout({ redirectUri: window.location.origin + '/Home' });

// const getToken = () => keycloak.token;

// const getTokenParsed = () => keycloak.tokenParsed;

// const isAuthenticated = (): boolean | undefined => {
//   return !!keycloak.token;
// }
// const getUsername = () => keycloak.tokenParsed?.preferred_username;

// const hasRole = (roles: string[]) => roles.some((role: string) => keycloak.hasRealmRole(role));

// const getKC = () => keycloak;

// const updateToken = (successCallback: () => any) =>
//   keycloak.updateToken(300)
//     .then(successCallback)
//     .catch(doLogin);

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