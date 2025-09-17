// React
import { FunctionComponent, useState, useEffect, useCallback } from "react";
// Components
import EvidenceVariableSection from "../EvidenceVariableSection/EvidenceVariableSection";
import EvidenceVariableModal from "../CustomEvidenceVariableModal/Modals/EvidenceVariableModal";
import ExistingInclusionCriteriaForm from "../CustomEvidenceVariableModal/Modals/ExistingInclusionCriteriaForm";
import ExistingCanonicalCriteriaForm from "../CustomEvidenceVariableModal/Modals/ExistingCanonicalCriteriaForm";
import CanonicalForm from "../CustomEvidenceVariableModal/Modals/CanonicalForm";
import ExpressionForm from "../CustomEvidenceVariableModal/Modals/ExpressionForm";
import CombinationForm from "../CustomEvidenceVariableModal/Modals/CombinationForm";
// Services
import EvidenceVariableService from "../../services/evidenceVariable.service";
import StudyService from "../../services/study.service";
import LibraryService from "../../services/library.service";
// Models
import {
  EvidenceVariableModel,
  EvidenceVariableUtils,
} from "../../../../shared/models/EvidenceVariable.model";
// Translation
import i18n from "i18next";
// Types
import {
  CanonicalFormData,
  CombinationFormData,
  EvidenceVariableActionType,
  ExistingCanonicalCriteriaFormData,
  ExistingCanonicalFormData,
  ExpressionFormData,
  FormEvidenceVariableData,
} from "../../types/evidenceVariable.types";

interface EvidenceVariableManagerProps {
  studyId: string;
  editMode: boolean;
  onLoading: (loading: boolean) => void;
  onError: () => void;
  onStudyVariablesChange?: (studyVariables: EvidenceVariableModel[]) => void;
}

const EvidenceVariableManager: FunctionComponent<
  EvidenceVariableManagerProps
> = ({ studyId, editMode, onLoading, onError, onStudyVariablesChange }) => {
  ////////////////////////////////
  //           State            //
  ////////////////////////////////

  // EvidenceVariables
  const [inclusionCriteria, setInclusionCriteria] = useState<
    EvidenceVariableModel[]
  >([]);
  const [studyVariables, setStudyVariables] = useState<EvidenceVariableModel[]>(
    []
  );

  // Modals state
  const [showExistingCriteriaModal, setShowExistingCriteriaModal] =
    useState(false);
  const [showNewCriteriaModal, setShowNewCriteriaModal] = useState(false);
  const [showCombinationModal, setShowCombinationModal] = useState(false);
  const [showExpressionModal, setShowExpressionModal] = useState(false);
  const [showExistingCanonicalModal, setShowExistingCanonicalModal] =
    useState(false);
  const [showNewCanonicalModal, setShowNewCanonicalModal] = useState(false);

  // Edit modal state
  const [showEditEVModal, setShowEditEVModal] = useState(false);
  const [editEVData, setEditEVData] = useState<
    FormEvidenceVariableData | undefined
  >();

  // Current path for action (used for modals to know where to add the criteria)
  const [currentActionPath, setCurrentActionPath] = useState<
    number[] | undefined
  >();

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Load evidence variables (inclusion criteria or study variables)
   */
  const loadEvidenceVariablesHandler = useCallback(
    async (type: "inclusion" | "study") => {
      try {
        const evidenceVariables =
          await EvidenceVariableService.loadEvidenceVariables(studyId, type);
        if (type === "inclusion") {
          setInclusionCriteria(evidenceVariables);
        } else {
          setStudyVariables(evidenceVariables);
          onStudyVariablesChange?.(evidenceVariables);
        }
      } catch (error) {
        console.error(`Error loading ${type} variables:`, error);
        onError();
      }
    },
    [studyId, onError, onStudyVariablesChange]
  );

  /**
   * Handle actions for inclusion criteria
   */
  const handleInclusionCriteriaAction = useCallback(
    (actionType: EvidenceVariableActionType, path?: number[]) => {
      setCurrentActionPath(path);
      switch (actionType) {
        case "new":
          setShowNewCriteriaModal(true);
          break;
        case "existing":
          setShowExistingCriteriaModal(true);
          break;
        case "combination":
          setShowCombinationModal(true);
          break;
        case "expression":
          setShowExpressionModal(true);
          break;
        case "existingCanonical":
          setShowExistingCanonicalModal(true);
          break;
        case "newCanonical":
          setShowNewCanonicalModal(true);
          break;
        default:
          break;
      }
    },
    []
  );

  /**
   * Generic handler to add criteria to study
   */
  const handleAddCriteria = useCallback(
    async (evidenceVariableId: string) => {
      try {
        onLoading(true);
        await StudyService.addEvidenceVariableToStudy(
          studyId,
          evidenceVariableId,
          "inclusion"
        );
        await loadEvidenceVariablesHandler("inclusion");
      } catch (error) {
        console.error("Error adding criteria:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [studyId, loadEvidenceVariablesHandler, onLoading]
  );

  /**
   * Handle saving new criteria
   */
  const handleSaveNewCriteria = useCallback(
    async (data: FormEvidenceVariableData) => {
      try {
        const createdEV =
          await EvidenceVariableService.createSimpleEvidenceVariable(data);
        await handleAddCriteria(createdEV.id!);
        setShowNewCriteriaModal(false);
      } catch (error) {
        console.error("Error creating new criteria:", error);
      }
    },
    [handleAddCriteria]
  );

  /**
   * Handle saving existing criteria
   */
  const handleSaveExistingCriteria = useCallback(
    async (data: { selectedEvidenceVariable?: FormEvidenceVariableData }) => {
      try {
        if (!data.selectedEvidenceVariable?.id) {
          alert(i18n.t("errormessage.noselectionmade"));
          return;
        }
        await handleAddCriteria(data.selectedEvidenceVariable.id);
        setShowExistingCriteriaModal(false);
      } catch (error) {
        console.error("Error adding existing criteria:", error);
      }
    },
    [handleAddCriteria]
  );

  /**
   * Handle saving combination
   */
  const handleSaveCombination = useCallback(
    async (data: CombinationFormData) => {
      try {
        onLoading(true);
        // The inclusion criteria should only have one parent EvidenceVariable
        if (inclusionCriteria.length > 0) {
          const parentEVId = inclusionCriteria[0].getId();
          await EvidenceVariableService.addDefinitionByCombination(
            parentEVId!,
            data,
            currentActionPath
          );
          await loadEvidenceVariablesHandler("inclusion");
          setShowCombinationModal(false);
          setCurrentActionPath(undefined);
        } else {
          alert(i18n.t("errormessage.noevidencevariablefound"));
        }
      } catch (error) {
        console.error("Error adding combination:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [inclusionCriteria, currentActionPath, loadEvidenceVariablesHandler]
  );

  /**
   * Handle saving existing canonical
   */
  const handleSaveExistingCanonical = useCallback(
    async (data: ExistingCanonicalCriteriaFormData) => {
      try {
        onLoading(true);
        if (inclusionCriteria.length > 0) {
          const parentEVId = inclusionCriteria[0].getId();
          if (!data.selectedEvidenceVariable?.url) {
            alert(i18n.t("errormessage.nourlontheevidencevariable"));
            return;
          }
          // Data to create the canonical evidence variable
          const canonicalData: ExistingCanonicalFormData = {
            exclude: data.exclude,
            canonicalUrl: data.selectedEvidenceVariable!.url,
            canonicalId: data.selectedEvidenceVariable!.identifier,
            canonicalDescription: data.selectedEvidenceVariable!.title,
          };
          await EvidenceVariableService.addExistingCanonical(
            parentEVId!,
            canonicalData,
            currentActionPath
          );
          await loadEvidenceVariablesHandler("inclusion");
          setShowExistingCanonicalModal(false);
          setCurrentActionPath(undefined);
        }
      } catch (error) {
        console.error("Error adding existing canonical:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [inclusionCriteria, currentActionPath, loadEvidenceVariablesHandler]
  );

  /**
   * Handle the creation of a new canonical evidence variable.
   */
  const handleSaveNewCanonical = useCallback(
    async (data: CanonicalFormData) => {
      try {
        onLoading(true);
        if (inclusionCriteria.length > 0) {
          const parentEVId = inclusionCriteria[0].getId();
          await EvidenceVariableService.addNewCanonical(
            parentEVId!,
            data.evidenceVariable,
            data.exclude,
            currentActionPath
          );
          await loadEvidenceVariablesHandler("inclusion");
          setShowNewCanonicalModal(false);
          setCurrentActionPath(undefined);
        } else {
          alert(i18n.t("errormessage.noevidencevariablefound"));
        }
      } catch (error) {
        console.error("Error adding new canonical:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [
      inclusionCriteria,
      currentActionPath,
      loadEvidenceVariablesHandler,
      onLoading,
    ]
  );

  /**
   * Handle the addition of an expression
   */
  const handleSaveExpression = useCallback(
    async (data: ExpressionFormData) => {
      try {
        onLoading(true);
        if (inclusionCriteria.length > 0) {
          const parentEVId = inclusionCriteria[0].getId();
          await EvidenceVariableService.addDefinitionExpression(
            parentEVId!,
            data,
            currentActionPath
          );
          await loadEvidenceVariablesHandler("inclusion");
          setShowExpressionModal(false);
          setCurrentActionPath(undefined);
        } else {
          alert(i18n.t("errormessage.noevidencevariablefound"));
        }
      } catch (error) {
        console.error("Error adding expression:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [
      inclusionCriteria,
      currentActionPath,
      loadEvidenceVariablesHandler,
      onLoading,
    ]
  );

  /**
   * Handle opening edit EV modal
   */
  const handleOpenEditEVModal = useCallback(
    async (evId: string) => {
      try {
        const evToEdit = inclusionCriteria.find((ev) => ev.getId() === evId);
        // If the evidence variable to edit is found, populate the edit form data and show the modal
        if (evToEdit) {
          const editData: FormEvidenceVariableData = {
            title: evToEdit.getTitle(),
            description: evToEdit.getDescription(),
            identifier: evToEdit.getIdentifier() || "",
            status: evToEdit.getStatus() || "",
            url: evToEdit.getUrl() || "",
            selectedLibrary: undefined,
          };
          // If the evidence variable is linked to a library, find and set the library reference
          const currentLibraryUrl = evToEdit.getLibraryUrl();
          if (currentLibraryUrl) {
            try {
              // Load all available libraries
              const availableLibraries = await LibraryService.loadLibraries();
              // Find the library that matches the current URL
              const matchingLibrary = availableLibraries.find(
                (lib) => lib.getUrl() === currentLibraryUrl
              );
              // If a matching library is found, set it as the selected library
              if (matchingLibrary) {
                editData.selectedLibrary =
                  matchingLibrary.toDisplayLibraryReference();
              }
            } catch (error) {
              console.error("Error loading libraries:", error);
            }
          }
          setEditEVData(editData);
          setShowEditEVModal(true);
        }
      } catch (error) {
        console.error("Error preparing edit data:", error);
      }
    },
    [inclusionCriteria]
  );

  /**
   * Handle the saving of an edited evidence variable.
   */
  const handleSaveEditEV = useCallback(
    async (data: FormEvidenceVariableData) => {
      try {
        onLoading(true);
        // The inclusion criteria should only have one parent EvidenceVariable
        if (inclusionCriteria.length > 0) {
          const evToUpdate = inclusionCriteria[0];
          const evId = evToUpdate.getId();
          // If the evidence variable ID is found, proceed to update
          if (evId) {
            // To update the evidence variable, we need to pass the new data and the original FHIR resource
            await EvidenceVariableService.updateEvidenceVariable(
              evId,
              data,
              evToUpdate.getFhirResource()
            );
            // Reload the inclusion criteria to reflect the changes
            await loadEvidenceVariablesHandler("inclusion");
            setShowEditEVModal(false);
          }
        }
      } catch (error) {
        console.error("Error updating EV:", error);
        alert(`${i18n.t("errormessage.errorwhileupdating")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [inclusionCriteria, loadEvidenceVariablesHandler, onLoading]
  );

  /**
   * Determine if the alert about combination absence should be shown.
   * @returns True if the alert about combination absence should be shown, false otherwise.
   */
  const showCombinationAbsenceAlert = () => {
    if (
      inclusionCriteria.length > 0 &&
      !inclusionCriteria[0].hasCharacteristic()
    ) {
      return true;
    }
    return false;
  };

  /**
   * To display the Inclusion Criteria
   */
  const inclusionCriteriaDisplayObjects =
    EvidenceVariableUtils.toDisplayObjects(inclusionCriteria);

  /**
   * To display the Study Variable
   */
  const studyVariablesDisplayObjects =
    EvidenceVariableUtils.toDisplayObjects(studyVariables);

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  useEffect(() => {
    if (studyId) {
      loadEvidenceVariablesHandler("inclusion");
      loadEvidenceVariablesHandler("study");
    }
  }, [studyId, loadEvidenceVariablesHandler]);

  /////////////////////////////////////////////
  //                Content                  //
  /////////////////////////////////////////////

  return (
    <>
      {/* EvidenceVariable Sections */}
      <EvidenceVariableSection
        evidenceVariables={inclusionCriteriaDisplayObjects}
        type="inclusion"
        editMode={editMode}
        onAction={handleInclusionCriteriaAction}
        evidenceVariableModels={inclusionCriteria}
        onEditEV={handleOpenEditEVModal}
      />

      <EvidenceVariableSection
        evidenceVariables={studyVariablesDisplayObjects}
        type="study"
        evidenceVariableModels={studyVariables}
      />

      {/* Modals - Only render when needed */}
      {showNewCriteriaModal && (
        <EvidenceVariableModal
          show={showNewCriteriaModal}
          mode="create"
          type="inclusion"
          onHide={() => setShowNewCriteriaModal(false)}
          onSave={handleSaveNewCriteria}
        />
      )}

      {showExistingCriteriaModal && (
        <ExistingInclusionCriteriaForm
          show={showExistingCriteriaModal}
          mode="create"
          onHide={() => setShowExistingCriteriaModal(false)}
          onSave={handleSaveExistingCriteria}
        />
      )}

      {showExistingCanonicalModal && (
        <ExistingCanonicalCriteriaForm
          show={showExistingCanonicalModal}
          mode="create"
          onHide={() => setShowExistingCanonicalModal(false)}
          onSave={handleSaveExistingCanonical}
          showCombinationAlert={showCombinationAbsenceAlert()}
        />
      )}

      {showNewCanonicalModal && (
        <CanonicalForm
          show={showNewCanonicalModal}
          mode="create"
          onHide={() => setShowNewCanonicalModal(false)}
          onSave={handleSaveNewCanonical}
          showCombinationAlert={showCombinationAbsenceAlert()}
        />
      )}

      {showExpressionModal && (
        <ExpressionForm
          show={showExpressionModal}
          mode="create"
          onHide={() => setShowExpressionModal(false)}
          onSave={handleSaveExpression}
          showCombinationAlert={showCombinationAbsenceAlert()}
        />
      )}

      {showCombinationModal && (
        <CombinationForm
          show={showCombinationModal}
          mode="create"
          onHide={() => setShowCombinationModal(false)}
          onSave={handleSaveCombination}
        />
      )}

      {showEditEVModal && (
        <EvidenceVariableModal
          show={showEditEVModal}
          onHide={() => setShowEditEVModal(false)}
          onSave={handleSaveEditEV}
          mode="update"
          type="inclusion"
          initialData={editEVData}
        />
      )}
    </>
  );
};

export default EvidenceVariableManager;
