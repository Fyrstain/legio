// Keycloak
import Keycloak, {
  KeycloakFlow,
  KeycloakInitOptions,
  KeycloakOnLoad,
  KeycloakPkceMethod
} from "keycloak-js";
import { getCurrentPublicUrl, toAbsolutePublicUrl, toAppPathname } from "./PublicUrl";

// Keycloak configuration
const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL as string,
  realm: process.env.REACT_APP_KEYCLOAK_REALM as string,
  clientId: process.env.REACT_APP_KEYCLOAK_REALM_CLIENT_ID as string,
}

// Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

///////////////////////////////
//        functions          //
///////////////////////////////

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = async (onAuthenticatedCallback: () => void) => {
  if (process.env.REACT_APP_E2E_MODE === "true") {
    onAuthenticatedCallback();
    return;
  }

  // The application is not rendered until Keycloak has authenticated the user.
  // This also ensures a deep link (for example /Studies/123) is restored after
  // the authorization-code redirect.
  const initOptions: KeycloakInitOptions = {
    onLoad: "login-required" as KeycloakOnLoad,
    pkceMethod: (process.env.REACT_APP_KEYCLOAK_PKCE_METHOD || "S256") as KeycloakPkceMethod,
    flow: (process.env.REACT_APP_KEYCLOAK_FLOW || "standard") as KeycloakFlow,
    checkLoginIframe: process.env.REACT_APP_KEYCLOAK_CHECKSSO_LOGIN_IFRAME === "true",
  };

  keycloak.onTokenExpired = () => {
    void keycloak.updateToken(30).catch(() => doLogin());
  };

  keycloak.onAuthLogout = () => {
    void doLogin();
  };

  try {
    const authenticated = await keycloak.init(initOptions);

    if (!authenticated) {
      await doLogin();
      return;
    }

    const postLoginRedirectUri = localStorage.getItem('postLoginRedirectUri');
    if (postLoginRedirectUri) {
      localStorage.removeItem('postLoginRedirectUri');
      window.location.assign(toAbsolutePublicUrl(toAppPathname(postLoginRedirectUri)));
      return;
    }

    onAuthenticatedCallback();
  } catch (error) {
    console.error("Keycloak initialization failed", error);
  }
};

/**
 * Redirects to Keycloak login page and sets the redirectUri to the current window location
 *
 * @returns Promise<void>
 */
const doLogin = (): Promise<void> => {
  return keycloak.login({ redirectUri: getCurrentPublicUrl() });
};

/**
 * Redirects to Keycloak logout page and sets the redirectUri to the Home page
 */
const doLogout = () => keycloak.logout({ redirectUri: toAbsolutePublicUrl('/Home') });

/**
 * Returns the token from the Keycloak instance
 */
const getToken = () => keycloak.token;

/**
 * Returns the parsed token from the Keycloak instance
 */
const getTokenParsed = () => keycloak.tokenParsed;

/**
 * Checks if the user is authenticated
 */
const isAuthenticated = (): boolean | undefined => {
   if (process.env.REACT_APP_E2E_MODE === "true") {
    return true;
  }
  return !!keycloak.token;
}

/**
 * Returns the username from the Keycloak instance
 */
const getUsername = () => keycloak.tokenParsed?.preferred_username;

/**
 * Checks if the user has a role
 * 
 * @param roles
 */
const hasRole = (roles: string[]) => roles.some((role: string) => keycloak.hasRealmRole(role));

/**
 * Returns the Keycloak instance
 */
const getKC = () => keycloak;

/**
 * Updates the token and calls the provided callback function if successfully authenticated.
 *
 * @param successCallback
 */
const updateToken = async <T,>(successCallback: () => T | Promise<T>): Promise<T> => {
  if (process.env.REACT_APP_E2E_MODE === "true") {
    return successCallback();
  }

  try {
    await keycloak.updateToken(30);
    return await successCallback();
  } catch (error) {
    await doLogin();
    throw error;
  }
};
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
