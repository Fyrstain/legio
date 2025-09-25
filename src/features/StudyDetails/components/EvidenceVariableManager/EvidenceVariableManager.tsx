// React
import {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
// Components
import EvidenceVariableSection from "../EvidenceVariableSection/EvidenceVariableSection";
import EvidenceVariableModal from "../CustomEvidenceVariableModal/Modals/EvidenceVariableModal";
import ExistingInclusionCriteriaForm from "../CustomEvidenceVariableModal/Modals/ExistingInclusionCriteriaForm";
import ExistingCanonicalForm from "../CustomEvidenceVariableModal/Modals/ExistingCanonicalForm";
import CanonicalForm from "../CustomEvidenceVariableModal/Modals/CanonicalForm";
import ExpressionForm from "../CustomEvidenceVariableModal/Modals/ExpressionForm";
import CombinationForm from "../CustomEvidenceVariableModal/Modals/CombinationForm";
import ExistingStudyVariableForm from "../CustomEvidenceVariableModal/Modals/ExistingStudyVariableForm";
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
  ExistingStudyVariableFormData,
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

  // EvidenceVariables (inclusion criteria and study variables)
  const [inclusionCriteria, setInclusionCriteria] = useState<
    EvidenceVariableModel[]
  >([]);
  const [studyVariables, setStudyVariables] = useState<EvidenceVariableModel[]>(
    []
  );

  // EvidenceVariable - Study Variable modal state
  const [showNewStudyModal, setShowNewStudyModal] = useState(false);
  const [showExistingStudyModal, setShowExistingStudyModal] = useState(false);

  // EvidenceVariable - Inclusion Criteria modal state
  const [showExistingCriteriaModal, setShowExistingCriteriaModal] =
    useState(false);
  const [showNewCriteriaModal, setShowNewCriteriaModal] = useState(false);
  const [showEditEVModal, setShowEditEVModal] = useState(false);
  const [editEVData, setEditEVData] = useState<
    FormEvidenceVariableData | undefined
  >();

  // definitionByCombination modal state
  const [showCombinationModal, setShowCombinationModal] = useState(false);
  const [combinationMode, setCombinationMode] = useState<"create" | "update">(
    "create"
  );
  const [combinationEditData, setCombinationEditData] = useState<
    CombinationFormData | undefined
  >();
  const [currentContext, setCurrentContext] = useState<"inclusion" | "study">(
    "inclusion"
  );

  // definitionExpression modal state
  const [showExpressionModal, setShowExpressionModal] = useState(false);
  const [expressionMode, setExpressionMode] = useState<"create" | "update">(
    "create"
  );
  const [expressionEditData, setExpressionEditData] = useState<
    ExpressionFormData | undefined
  >();

  // definitionCanonical state
  const [showExistingCanonicalModal, setShowExistingCanonicalModal] =
    useState(false);
  const [showNewCanonicalModal, setShowNewCanonicalModal] = useState(false);
  const [showEditCanonicalModal, setShowEditCanonicalModal] = useState(false);
  const [editCanonicalData, setEditCanonicalData] = useState<
    CanonicalFormData | undefined
  >();
  const [originalCanonicalUrl, setOriginalCanonicalUrl] = useState<
    string | undefined
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
   * Handle actions for study variables
   */
  const handleStudyVariableAction = useCallback(
    async (
      actionType: EvidenceVariableActionType,
      path?: number[],
      editData?: any
    ) => {
      setCurrentActionPath(path);
      setCurrentContext("study");
      switch (actionType) {
        case "new":
          setShowNewStudyModal(true);
          break;
        case "existing":
          setShowExistingStudyModal(true);
          break;
        case "combination":
          setCurrentContext("study");
          if (editData) {
            setCombinationEditData(editData);
            setCombinationMode("update");
          } else {
            setCombinationEditData(undefined);
            setCombinationMode("create");
          }
          setShowCombinationModal(true);
          break;
        case "newCanonical":
          setShowNewCanonicalModal(true);
          break;
        case "existingCanonical":
          setCurrentContext("study");
          setShowExistingCanonicalModal(true);
          break;
        case "editCanonical":
          if (editData.evidenceVariable.id) {
            const referencedEVModel =
              await EvidenceVariableService.getEvidenceVariableById(
                editData.evidenceVariable.id
              );
            const libraryUrl = referencedEVModel.getLibraryUrl();
            if (libraryUrl) {
              editData.evidenceVariable.selectedLibrary =
                await findLibraryByUrl(libraryUrl);
            }
          }
          setEditCanonicalData(editData);
          setOriginalCanonicalUrl(editData.evidenceVariable.url);
          setShowEditCanonicalModal(true);
          break;
        default:
          break;
      }
    },
    []
  );

  /**
   * Handle adding a study to the study variables
   */
  const handleAddStudy = useCallback(
    async (evidenceVariableId: string) => {
      try {
        onLoading(true);
        await StudyService.addEvidenceVariableToStudy(
          studyId,
          evidenceVariableId,
          "study"
        );
        await loadEvidenceVariablesHandler("study");
      } catch (error) {
        console.error("Error adding study:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [studyId, loadEvidenceVariablesHandler, onLoading]
  );

  /**
   * Handle saving new study variable
   */
  const handleSaveNewStudy = useCallback(
    async (data: FormEvidenceVariableData) => {
      try {
        const createdStudy =
          await EvidenceVariableService.createSimpleEvidenceVariable(data);
        await handleAddStudy(createdStudy.id!);
        setShowNewStudyModal(false);
      } catch (error) {
        console.error("Error creating new study:", error);
      }
    },
    [handleAddStudy]
  );

  /**
   * Handle saving existing study
   */
  const handleSaveExistingStudy = useCallback(
    async (data: ExistingStudyVariableFormData) => {
      try {
        if (!data.selectedStudyVariable?.id) {
          alert(i18n.t("errormessage.noselectionmade"));
          return;
        }
        await handleAddStudy(data.selectedStudyVariable.id);
        setShowExistingStudyModal(false);
      } catch (error) {
        console.error("Error adding existing study:", error);
      }
    },
    [handleAddStudy]
  );

  /**
   * Handle actions for inclusion criteria
   */
  const handleInclusionCriteriaAction = useCallback(
    async (
      actionType: EvidenceVariableActionType,
      path?: number[],
      editData?: any
    ) => {
      setCurrentContext("inclusion");
      setCurrentActionPath(path);
      switch (actionType) {
        case "new":
          setShowNewCriteriaModal(true);
          break;
        case "existing":
          setShowExistingCriteriaModal(true);
          break;
        case "combination":
          if (editData) {
            // Edit Mode
            setCombinationEditData(editData);
            setCombinationMode("update");
          } else {
            // Create Mode
            setCombinationEditData(undefined);
            setCombinationMode("create");
          }
          setShowCombinationModal(true);
          break;
        case "expression":
          if (editData) {
            // To find and populate library reference from URL
            if (editData.selectedLibrary?.url) {
              editData.selectedLibrary = await findLibraryByUrl(
                editData.selectedLibrary.url
              );
            }
            setExpressionEditData(editData);
            setExpressionMode("update");
          } else {
            // Create Mode
            setExpressionEditData(undefined);
            setExpressionMode("create");
          }
          setShowExpressionModal(true);
          break;
        case "existingCanonical":
          setShowExistingCanonicalModal(true);
          break;
        case "newCanonical":
          setShowNewCanonicalModal(true);
          break;
        case "editCanonical":
          // To find and populate library reference from URL
          if (editData.evidenceVariable.id) {
            const referencedEVModel =
              await EvidenceVariableService.getEvidenceVariableById(
                editData.evidenceVariable.id
              );
            const libraryUrl = referencedEVModel.getLibraryUrl();
            // If the evidence variable is linked to a library, find and set the library reference
            if (libraryUrl) {
              editData.evidenceVariable.selectedLibrary =
                await findLibraryByUrl(libraryUrl);
            }
          }
          setEditCanonicalData(editData);
          setOriginalCanonicalUrl(editData.evidenceVariable.url);
          setShowEditCanonicalModal(true);
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
        let parentEVId: string | undefined;
        // For the study combination, we need to check if there are study variables
        if (currentContext === "study") {
          if (studyVariables.length === 0) {
            alert(i18n.t("errormessage.nostudyvariablefound"));
            return;
          }
          parentEVId = studyVariablesForDisplay[0]?.getId();
        } else {
          // The inclusion criteria should only have one parent EvidenceVariable
          if (inclusionCriteria.length === 0) {
            alert(i18n.t("errormessage.noevidencevariablefound"));
            return;
          }
          parentEVId = inclusionCriteriaForDisplay[0]?.getId();
        }
        if (combinationMode === "update" && currentActionPath) {
          // Edit mode
          await EvidenceVariableService.updateDefinitionByCombination(
            parentEVId!,
            data,
            currentActionPath
          );
        } else {
          // Create mode
          await EvidenceVariableService.addDefinitionByCombination(
            parentEVId!,
            data,
            currentActionPath
          );
        }
        // Refresh the inclusion criteria list
        await loadEvidenceVariablesHandler(currentContext);
        setShowCombinationModal(false);
        setCurrentActionPath(undefined);
        setCombinationEditData(undefined);
        setCombinationMode("create");
      } catch (error) {
        console.error("Error saving combination:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [
      currentContext,
      inclusionCriteria,
      studyVariables,
      currentActionPath,
      combinationMode,
      loadEvidenceVariablesHandler,
      onLoading,
    ]
  );

  /**
   * Handle saving existing canonical
   */
  const handleSaveExistingCanonical = useCallback(
    async (data: ExistingCanonicalCriteriaFormData) => {
      try {
        onLoading(true);
        // Find the parent EvidenceVariable (the one to which we will add the canonical reference)
        let parentEVId: string | undefined;
        // If it's a study context, we need to check if there are study variables
        if (currentContext === "study") {
          if (studyVariables.length > 0) {
            parentEVId = studyVariables[0].getId();
          } else {
            alert(i18n.t("errormessage.noevidencevariablefound"));
            return;
          }
        } else {
          // The inclusion criteria should only have one parent EvidenceVariable
          if (inclusionCriteria.length > 0) {
            parentEVId = inclusionCriteria[0].getId();
          } else {
            alert(i18n.t("errormessage.noevidencevariablefound"));
            return;
          }
        }
        // Ensure a selection was made
        if (!data.selectedEvidenceVariable?.id) {
          alert(i18n.t("errormessage.noselectionmade"));
          return;
        }
        // Call the service to add the existing canonical evidence variable with copy
        await EvidenceVariableService.addExistingCanonicalWithCopy(
          parentEVId!,
          data.selectedEvidenceVariable.id,
          data.exclude,
          currentActionPath
        );
        // Refresh the inclusion criteria list
        await loadEvidenceVariablesHandler(currentContext);
        setShowExistingCanonicalModal(false);
        setCurrentActionPath(undefined);
      } catch (error) {
        console.error("Error adding existing canonical:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [
      currentContext,
      inclusionCriteria,
      studyVariables,
      currentActionPath,
      loadEvidenceVariablesHandler,
      onLoading,
    ]
  );

  /**
   * Handle the creation of a new canonical evidence variable.
   */
  const handleSaveNewCanonical = useCallback(
    async (data: CanonicalFormData) => {
      try {
        onLoading(true);
        let parentEVId: string | undefined;
        if (currentContext === "study") {
          if (studyVariables.length > 0) {
            parentEVId = studyVariables[0].getId();
          } else {
            alert(i18n.t("errormessage.noevidencevariablefound"));
            return;
          }
        } else {
          if (inclusionCriteria.length > 0) {
            parentEVId = inclusionCriteria[0].getId();
          } else {
            alert(i18n.t("errormessage.noevidencevariablefound"));
            return;
          }
        }
        // If the context is study,we need to pass the selected expression
        const selectedExpression =
          currentContext === "study" ? data.selectedExpression : undefined;
        // Call the service to add the new canonical evidence variable
        await EvidenceVariableService.addNewCanonical(
          parentEVId!,
          data.evidenceVariable,
          data.exclude,
          currentActionPath,
          selectedExpression
        );
        // Refresh the inclusion criteria list
        await loadEvidenceVariablesHandler(currentContext);
        setShowNewCanonicalModal(false);
        setCurrentActionPath(undefined);
      } catch (error) {
        console.error("Error adding new canonical:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [
      inclusionCriteria,
      studyVariables,
      currentContext,
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
        // The inclusion criteria should only have one parent EvidenceVariable
        if (inclusionCriteria.length === 0) {
          alert(i18n.t("errormessage.noevidencevariablefound"));
          return;
        }
        const parentEVId = inclusionCriteria[0].getId();
        // Depending on the mode, call the appropriate service function
        if (expressionMode === "update" && currentActionPath) {
          // EDIT mode
          await EvidenceVariableService.updateDefinitionExpression(
            parentEVId!,
            data,
            currentActionPath
          );
        } else {
          // CREATE mode
          await EvidenceVariableService.addDefinitionExpression(
            parentEVId!,
            data,
            currentActionPath
          );
        }
        // Refresh the inclusion criteria list
        await loadEvidenceVariablesHandler("inclusion");
        setShowExpressionModal(false);
        setCurrentActionPath(undefined);
        setExpressionEditData(undefined);
        setExpressionMode("create");
      } catch (error) {
        console.error("Error saving expression:", error);
        alert(`${i18n.t("errormessage.errorwhileaddingcriteria")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [
      inclusionCriteria,
      currentActionPath,
      expressionMode,
      loadEvidenceVariablesHandler,
      onLoading,
    ]
  );

  /**
   * Handle opening edit EV modal
   */
  const handleOpenEditEVModal = useCallback(
    async (evId: string, contextOverride?: "inclusion" | "study") => {
      // Determine the context to use
      const context = contextOverride || currentContext;
      // Find the evidence variable to edit
      try {
        const evToEdit =
          context === "inclusion"
            ? inclusionCriteria.find((ev) => ev.getId() === evId)
            : studyVariables.find((ev) => ev.getId() === evId);
        // If the evidence variable is found, prepare the edit data
        if (evToEdit) {
          const editData: FormEvidenceVariableData = {
            title: evToEdit.getTitle(),
            description: evToEdit.getDescription(),
            identifier: evToEdit.getIdentifier() || "",
            status: evToEdit.getStatus() || "",
            url: evToEdit.getUrl() || "",
            selectedLibrary: undefined,
          };
          // To find and populate library reference from URL
          const currentLibraryUrl = evToEdit.getLibraryUrl();
          if (currentLibraryUrl) {
            editData.selectedLibrary = await findLibraryByUrl(
              currentLibraryUrl
            );
          }
          // Open the modal with the prepared data
          setCurrentContext(context);
          setEditEVData(editData);
          setShowEditEVModal(true);
        }
      } catch (error) {
        console.error("Error preparing edit data:", error);
      }
    },
    [inclusionCriteria, studyVariables, currentContext]
  );

  /**
   * Handle the saving of an edited evidence variable.
   */
  const handleSaveEditEV = useCallback(
    async (data: FormEvidenceVariableData) => {
      try {
        onLoading(true);
        const currentEvidenceVariableType =
          currentContext === "inclusion" ? inclusionCriteria : studyVariables;
        // The inclusion criteria should only have one parent EvidenceVariable
        if (currentEvidenceVariableType.length > 0) {
          const evToUpdate = currentEvidenceVariableType[0];
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
            await loadEvidenceVariablesHandler(currentContext);
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
    [
      inclusionCriteria,
      studyVariables,
      currentContext,
      loadEvidenceVariablesHandler,
      onLoading,
    ]
  );

  /**
   * Handle the saving of an edited canonical evidence variable.
   */
  const handleSaveEditCanonical = useCallback(
    async (data: CanonicalFormData) => {
      console.log("handleSaveEditCanonical - Received data:", data);

      try {
        onLoading(true);
        // Find the parent EvidenceVariable (the one to which we will update the canonical characteristic)
        let parentEVId: string | undefined;
        // If it's a study context, we need to check if there are study variables
        if (currentContext === "study") {
          if (studyVariables.length > 0) {
            parentEVId = studyVariables[0].getId();
          } else {
            alert(i18n.t("errormessage.noevidencevariablefound"));
            return;
          }
        } else {
          // The inclusion criteria should only have one parent EvidenceVariable
          if (inclusionCriteria.length > 0) {
            parentEVId = inclusionCriteria[0].getId();
          } else {
            alert(i18n.t("errormessage.noevidencevariablefound"));
            return;
          }
        }
        // Ensure we have the original canonical URL to identify which characteristic to update
        if (originalCanonicalUrl && parentEVId) {
          await EvidenceVariableService.updateCanonicalCharacteristic(
            parentEVId,
            currentActionPath!,
            data,
            originalCanonicalUrl
          );
        }
        // Refresh the inclusion criteria list
        await loadEvidenceVariablesHandler(currentContext);
        setShowEditCanonicalModal(false);
        setCurrentActionPath(undefined);
        setEditCanonicalData(undefined);
        setOriginalCanonicalUrl(undefined);
      } catch (error) {
        console.error("Error updating canonical:", error);
        alert(`${i18n.t("errormessage.errorwhileupdating")} ${error}`);
      } finally {
        onLoading(false);
      }
    },
    [
      currentContext,
      inclusionCriteria,
      studyVariables,
      currentActionPath,
      originalCanonicalUrl,
      loadEvidenceVariablesHandler,
      onLoading,
    ]
  );

  /**
   * Determine if the alert about combination absence should be shown.
   * @returns True if the alert about combination absence should be shown, false otherwise.
   */
  const showCombinationAbsenceAlert = (context: "inclusion" | "study") => {
    if (context === "inclusion") {
      return (
        inclusionCriteria.length > 0 &&
        !inclusionCriteria[0].hasCharacteristic()
      );
    }
    if (context === "study") {
      return (
        studyVariables.length > 0 && !studyVariables[0].hasCharacteristic()
      );
    }
    return false;
  };

  /**
   * Find and populate library reference from URL
   * @param libraryUrl The URL of the library to find
   * @returns LibraryReference or undefined if not found
   */
  const findLibraryByUrl = useCallback(async (libraryUrl: string) => {
    if (!libraryUrl) return undefined;
    try {
      const availableLibraries = await LibraryService.loadLibraries();
      const matchingLibrary = availableLibraries.find(
        (lib) => lib.getUrl() === libraryUrl
      );
      return matchingLibrary?.toDisplayLibraryReference();
    } catch (error) {
      console.error("Error loading libraries:", error);
      return undefined;
    }
  }, []);

  /**
   * To display the Inclusion Criteria
   */
  const inclusionCriteriaForDisplay = useMemo(
    () => inclusionCriteria.filter((ev) => ev.hasDefinitionByCombination()),
    [inclusionCriteria]
  );
  const inclusionCriteriaDisplayObjects =
    EvidenceVariableUtils.toDisplayObjects(inclusionCriteriaForDisplay);

  /**
   * To display the Study Variable
   */
  const studyVariablesForDisplay = useMemo(
    () => studyVariables.filter((ev) => ev.hasDefinitionByCombination()),
    [studyVariables]
  );
  const studyVariablesDisplayObjects = EvidenceVariableUtils.toDisplayObjects(
    studyVariablesForDisplay
  );

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
        evidenceVariableModels={inclusionCriteriaForDisplay}
        onEditEV={(evId) => handleOpenEditEVModal(evId, "inclusion")}
      />

      <EvidenceVariableSection
        evidenceVariables={studyVariablesDisplayObjects}
        type="study"
        editMode={editMode}
        onAction={handleStudyVariableAction}
        evidenceVariableModels={studyVariablesForDisplay}
        onEditEV={(evId) => handleOpenEditEVModal(evId, "study")}
      />

      {/* Modals - Only render when needed */}

      {showNewStudyModal && (
        <EvidenceVariableModal
          show={showNewStudyModal}
          mode="create"
          type="study"
          onHide={() => setShowNewStudyModal(false)}
          onSave={handleSaveNewStudy}
        />
      )}

      {showExistingStudyModal && (
        <ExistingStudyVariableForm
          show={showExistingStudyModal}
          mode="create"
          onHide={() => setShowExistingStudyModal(false)}
          onSave={handleSaveExistingStudy}
        />
      )}

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
        <ExistingCanonicalForm
          show={showExistingCanonicalModal}
          mode="create"
          type={currentContext}
          onHide={() => setShowExistingCanonicalModal(false)}
          onSave={handleSaveExistingCanonical}
          showCombinationAlert={showCombinationAbsenceAlert(currentContext)}
        />
      )}

      {showNewCanonicalModal && (
        <CanonicalForm
          show={showNewCanonicalModal}
          mode="create"
          type={currentContext}
          onHide={() => setShowNewCanonicalModal(false)}
          onSave={handleSaveNewCanonical}
          showCombinationAlert={showCombinationAbsenceAlert(currentContext)}
        />
      )}

      {showExpressionModal && (
        <ExpressionForm
          show={showExpressionModal}
          mode={expressionMode}
          onHide={() => {
            setShowExpressionModal(false);
            setExpressionEditData(undefined);
            setExpressionMode("create");
            setCurrentActionPath(undefined);
          }}
          onSave={handleSaveExpression}
          initialData={expressionEditData}
          showCombinationAlert={showCombinationAbsenceAlert(currentContext)}
        />
      )}

      {showCombinationModal && (
        <CombinationForm
          show={showCombinationModal}
          mode={combinationMode}
          type={currentContext}
          onHide={() => {
            setShowCombinationModal(false);
            setCombinationEditData(undefined);
            setCombinationMode("create");
            setCurrentContext("inclusion");
          }}
          onSave={handleSaveCombination}
          initialData={combinationEditData}
        />
      )}

      {showEditEVModal && (
        <EvidenceVariableModal
          show={showEditEVModal}
          onHide={() => setShowEditEVModal(false)}
          onSave={handleSaveEditEV}
          mode="update"
          type={currentContext}
          initialData={editEVData}
        />
      )}

      {showEditCanonicalModal && (
        <CanonicalForm
          show={showEditCanonicalModal}
          mode="update"
          type={currentContext}
          onHide={() => {
            setShowEditCanonicalModal(false);
            setEditCanonicalData(undefined);
            setCurrentActionPath(undefined);
            setOriginalCanonicalUrl(undefined);
          }}
          onSave={handleSaveEditCanonical}
          initialData={editCanonicalData}
          showCombinationAlert={showCombinationAbsenceAlert(currentContext)}
        />
      )}
    </>
  );
};

export default EvidenceVariableManager;
