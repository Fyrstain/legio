// Resources
import { Bundle, Library } from "fhir/r5";
// Client
import Client from "fhir-kit-client";
// Model
import { LibraryModel } from "../../../shared/models/Library.model";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirKnowledgeClient = new Client({
  baseUrl: process.env.REACT_APP_KNOWLEDGE_URL ?? "fhir",
});

/**
 * Load all libraries from the FHIR server
 *
 * @returns A promise of an array of LibraryModel instances
 */
async function loadLibraries(): Promise<LibraryModel[]> {
  try {
    const bundle = (await fhirKnowledgeClient.search({
      resourceType: "Library",
      searchParams: { _count: 10000 },
    })) as Bundle;
    // Convert Bundle to LibraryModel instances
    return LibraryModel.fromBundle(bundle);
  } catch (error) {
    throw new Error(`Error loading libraries: ${error}`);
  }
}

/**
 * Load a specific library by its ID
 *
 * @param id The ID of the library to load
 * @returns A promise of a LibraryModel instance
 */
async function loadLibrary(id: string): Promise<LibraryModel> {
  try {
    const library = (await fhirKnowledgeClient.read({
      resourceType: "Library",
      id: id,
    })) as Library;
    return LibraryModel.fromResource(library);
  } catch (error) {
    throw new Error(`Error loading library with ID ${id}: ${error}`);
  }
}

////////////////////////////
//        Exports         //
////////////////////////////

const LibraryService = {
  loadLibraries,
  loadLibrary,
};

export default LibraryService;
