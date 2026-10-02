import axios from "axios";
import Client from "fhir-kit-client";
import UserService from "./UserService";
import { installRequestAuthorization } from "./RequestAuthorization";

jest.mock("axios", () => jest.requireActual("axios/dist/browser/axios.cjs"));

jest.mock("./UserService", () => ({
  __esModule: true,
  default: {
    getKC: jest.fn(),
    doLogin: jest.fn(),
  },
}));

test("adds the Keycloak token to FHIR fetch and Axios requests", async () => {
  const previousFhirUrl = process.env.REACT_APP_FHIR_URL;
  const previousKeycloakUrl = process.env.REACT_APP_KEYCLOAK_URL;
  const previousRealm = process.env.REACT_APP_KEYCLOAK_REALM;
  process.env.REACT_APP_FHIR_URL = "https://api.example.test/fhir";
  process.env.REACT_APP_KEYCLOAK_URL = window.location.origin;
  process.env.REACT_APP_KEYCLOAK_REALM = "test";

  const updateToken = jest.fn().mockResolvedValue(true);
  UserService.getKC.mockReturnValue({ token: "current-token", updateToken });

  const originalFetch = window.fetch;
  const networkFetch = jest.fn().mockResolvedValue(
    new Response(JSON.stringify({ resourceType: "Patient", id: "123" }), {
      status: 200,
      headers: { "Content-Type": "application/fhir+json" },
    }),
  );
  window.fetch = networkFetch;

  try {
    installRequestAuthorization();

    const client = new Client({ baseUrl: process.env.REACT_APP_FHIR_URL });
    await client.read({ resourceType: "Patient", id: "123" });
    expect(networkFetch.mock.calls[0][0].headers.get("Authorization"))
      .toBe("Bearer current-token");
    expect(updateToken).toHaveBeenCalledWith(30);

    let axiosAuthorization;
    await axios.get("https://api.example.test/fhir/Patient/456", {
      adapter: async (config) => {
        axiosAuthorization = config.headers.get("Authorization");
        return { config, data: {}, status: 200, statusText: "OK", headers: {} };
      },
    });
    expect(axiosAuthorization).toBe("Bearer current-token");

    const keycloakUrl = `${window.location.origin}/realms/test/protocol/openid-connect/token`;
    await window.fetch(keycloakUrl);
    expect(networkFetch.mock.calls[1][0]).toBe(keycloakUrl);

    const externalUrl = "https://external.example.test/resource";
    await window.fetch(externalUrl);
    expect(networkFetch.mock.calls[2][0]).toBe(externalUrl);
  } finally {
    window.fetch = originalFetch;
    for (const [name, value] of [
      ["REACT_APP_FHIR_URL", previousFhirUrl],
      ["REACT_APP_KEYCLOAK_URL", previousKeycloakUrl],
      ["REACT_APP_KEYCLOAK_REALM", previousRealm],
    ]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
