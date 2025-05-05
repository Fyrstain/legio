// FHIR
import Client from "fhir-kit-client";

/**
 * Factory function to create a MOCK FHIR client.
 *
 * @returns an instance of FHIR client.
 */
export function createMockFhirClient(): Client {
  const baseUrl = process.env.REACT_APP_FHIR_URL_MOCK ?? "fhir";
  return new Client({ baseUrl });
}