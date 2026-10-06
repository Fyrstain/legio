import axios from "axios";
import { installRequestAuthorization as installSharedRequestAuthorization } from "@fyrstain/hl7-front-library";
import UserService from "./UserService";

function getKeycloakRealmUrl(): string[] {
  const base = process.env.REACT_APP_KEYCLOAK_URL;
  const realm = process.env.REACT_APP_KEYCLOAK_REALM;
  if (!base || !realm) return [];

  try {
    return [new URL(`realms/${encodeURIComponent(realm)}/`, `${base.replace(/\/+$/, "")}/`).href];
  } catch {
    return [];
  }
}

export function installRequestAuthorization(): void {
  const serviceBaseUrls = [
    process.env.REACT_APP_FHIR_URL ?? "fhir",
    process.env.REACT_APP_COHORTING_URL,
    process.env.REACT_APP_DATAMART_URL,
    process.env.REACT_APP_KNOWLEDGE_URL,
    process.env.REACT_APP_TERMINOLOGY_URL,
    process.env.REACT_APP_MAPPING_URL,
    process.env.REACT_APP_CQL_URL,
  ].filter((url): url is string => !!url?.trim());

  installSharedRequestAuthorization({
    getAccessToken: async () => {
      const keycloak = UserService.getKC();
      if (!keycloak.token) return undefined;

      try {
        await keycloak.updateToken(30);
        return keycloak.token;
      } catch (error) {
        await UserService.doLogin();
        throw error;
      }
    },
    serviceBaseUrls,
    excludeBaseUrls: getKeycloakRealmUrl(),
    axios,
  });
}
