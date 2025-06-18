// FHIR
import Client from "fhir-kit-client";

/**
 * Factory function to create a FHIR client.
 *
 * @returns an instance of FHIR client.
 */
export function createFhirClient(): Client {
  const baseUrl = process.env.REACT_APP_FHIR_URL ?? "fhir";
  return new Client({ baseUrl });
}
