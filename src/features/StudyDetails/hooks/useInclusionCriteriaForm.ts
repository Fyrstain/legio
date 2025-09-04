// React
import { ChangeEvent, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Types
import {
  EvidenceVariableFormType,
  EvidenceVariableProps,
  EvidenceVariableFormData,
  InclusionCriteriaValue,
} from "../types/evidenceVariable.types";
import { LibraryReference, LibraryParameter } from "../types/library.types";
// Services
import LibraryService from "../services/library.service";
// Models
import { LibraryModel } from "../../../shared/models/Library.model";
// Utils
import { getUITypeFromLibraryParameter } from "../../../shared/utils/libraryParameterMapping";

/**
 * Hooks for managing the inclusion criteria form
 * @param formType is the type of the form (firstGroup, inclusionCriteria, subGroup)
 * @param initialEvidenceVariable is the initial data for the evidence variable
 * @param initialFormData is the initial data for the form
 * @returns a set of handlers and state for managing the form
 */
export const useInclusionCriteriaForm = (
  formType: EvidenceVariableFormType,
  initialEvidenceVariable?: EvidenceVariableProps,
  initialFormData?: EvidenceVariableFormData
) => {
  const navigate = useNavigate();

  ////////////////////////////////
  //           States           //
  ////////////////////////////////

  // Evidence Variable Data
  const [evidenceVariableData, setEvidenceVariableData] =
    useState<EvidenceVariableProps>({
      id: initialEvidenceVariable?.id || "",
      status: initialEvidenceVariable?.status || "",
      identifier: initialEvidenceVariable?.identifier || "",
      title: initialEvidenceVariable?.title || "",
      description: initialEvidenceVariable?.description || "",
      isExcluded: initialEvidenceVariable?.isExcluded || false,
      characteristicDescription:
        initialEvidenceVariable?.characteristicDescription || "",
    });

  // Form Data (other fields to manage)
  const [formData, setFormData] = useState<EvidenceVariableFormData>({
    selectedLibrary: initialFormData?.selectedLibrary,
    selectedExpression: initialFormData?.selectedExpression || "",
    selectedParameter: initialFormData?.selectedParameter || "",
    selectedComparator: initialFormData?.selectedComparator || "",
    criteriaValue: initialFormData?.criteriaValue,
  });

  const [libraries, setLibraries] = useState<LibraryModel[]>([]);

  // TODO : 
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryModel | null>(
    null
  );

  const [availableExpressions, setAvailableExpressions] = useState<
    LibraryParameter[]
  >([]);

  const [availableParameters, setAvailableParameters] = useState<
    LibraryParameter[]
  >([]);

  // To see if expressions and parameters should be loaded and see the conditional fields
  const shouldLoadExpressions =
    formType === "inclusionCriteria" || formType === "subGroup";
  const shouldShowConditionalFields =
    formType === "inclusionCriteria" || formType === "subGroup";

  ////////////////////////////////
  //        Navigation          //
  ////////////////////////////////

  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  ////////////////////////////////
  //        LifeCycle           //
  ////////////////////////////////

  // To load libraries data
  useEffect(() => {
    const loadLibrariesData = async () => {
      try {
        const librariesData = await LibraryService.loadLibraries();
        setLibraries(librariesData);
      } catch (error) {
        onError();
      }
    };
    loadLibrariesData();
  }, [onError]);

  // To reset selectedLibrary and available expressions/parameters
  useEffect(() => {
    if (!formData.selectedLibrary) {
      setSelectedLibrary(null);
      setAvailableExpressions([]);
      setAvailableParameters([]);
    } else if (libraries.length > 0) {
      const library = libraries.find(
        (lib) => lib.getId() === formData.selectedLibrary?.id
      );
      if (library) {
        setSelectedLibrary(library);
      }
    }
  }, [formData.selectedLibrary, libraries]);

  // To update expressions and parameters when the library changes
  useEffect(() => {
    if (shouldLoadExpressions && selectedLibrary) {
      setAvailableExpressions(selectedLibrary.getExpressions());
      setAvailableParameters(selectedLibrary.getInputParameters());
    } else {
      setAvailableExpressions([]);
      setAvailableParameters([]);
    }
  }, [selectedLibrary, shouldLoadExpressions]);

  ////////////////////////////////
  //          Handlers          //
  ////////////////////////////////

  /**
   * Handle status change from StatusSelect
   * @param status
   */
  const handleStatusChange = (status: string) => {
    setEvidenceVariableData((prev) => ({ ...prev, status }));
  };

  /**
   * Handle identifier change from IdentifierInput
   * @param e is the change event from the input
   */
  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEvidenceVariableData((prev) => ({
      ...prev,
      identifier: e.target.value,
    }));
  };

  /**
   * Handle title change from TitleInput
   * @param e is the change event from the input
   */
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEvidenceVariableData((prev) => ({ ...prev, title: e.target.value }));
  };

  /**
   * Handle description change from DescriptionInput
   * @param e is the change event from the input
   */
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEvidenceVariableData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  /**
   * Handle characteristic description change from CharacteristicDescriptionInput
   * @param e is the change event from the input
   */
  const handleCharacteristicDescriptionChange = (
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEvidenceVariableData((prev) => ({
      ...prev,
      characteristicDescription: e.target.value,
    }));
  };

  /**
   * Handle isExcluded change from IsExcludedInput
   * @param isExcluded
   */
  const handleIsExcludedChange = (isExcluded: boolean) => {
    setEvidenceVariableData((prev) => ({ ...prev, isExcluded }));
  };

  /**
   * Handle library change from LibrarySelect
   * @param library
   */
  const handleLibraryChange = (library?: LibraryReference) => {
    setFormData((prev) => ({
      ...prev,
      selectedLibrary: library,
      selectedExpression: "",
      selectedParameter: "",
      criteriaValue: undefined,
    }));
  };

  /**
   * Handle expression change from ExpressionInput
   * @param expression
   */
  const handleExpressionChange = (expression: string) => {
    setFormData((prev) => ({ ...prev, selectedExpression: expression }));
  };

  /**
   * Handle parameter change from ParameterInput
   * @param parameter
   */
  const handleParameterChange = (parameter: string) => {
    setFormData((prev) => ({ ...prev, selectedParameter: parameter }));
  };

  /**
   * Handle criteria value change from CriteriaValueInput
   * @param value
   */
  const handleCriteriaValueChange = (value: InclusionCriteriaValue) => {
    setFormData((prev) => ({ ...prev, criteriaValue: value }));
  };

  /**
   * Handle library selection change from LibrarySelect
   * @param e is the change event from the select
   * @returns
   */
  const handleLibrarySelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const libraryId = e.target.value;
    if (!libraryId) {
      handleLibraryChange(undefined);
    }
    const library = libraries.find((lib) => lib.getId() === libraryId);
    if (library) {
      const libraryReference = library.toDisplayLibraryReference();
      handleLibraryChange(libraryReference);
    }
  };

  /**
   * Handle parameter selection change from ParameterSelect
   * @param e is the change event from the select
   */
  const handleParameterSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const parameterName = e.target.value;
    handleParameterChange(parameterName);

    if (parameterName && selectedLibrary) {
      const parameter = availableParameters.find(
        (p) => p.name === parameterName
      );
      if (parameter) {
        const uiType = getUITypeFromLibraryParameter(parameter.type);
        handleCriteriaValueChange({
          type: uiType,
          value: undefined,
        });
      }
    }
  };

  ////////////////////////////////
  //       Validation           //
  ////////////////////////////////

  /**
   * Function to validate the form
   * @returns boolean indicating if the form is valid
   */
  const validateForm = useCallback((): boolean => {
    const hasRequiredFields = !!(
      evidenceVariableData.title &&
      evidenceVariableData.title.trim() &&
      evidenceVariableData.description &&
      evidenceVariableData.description.trim()
    );
    switch (formType) {
      case "firstGroup":
        // FirstGroup : base fields and library
        return hasRequiredFields;
      case "inclusionCriteria":
        // InclusionCriteria : base fields and library + expression
        return (
          hasRequiredFields &&
          !!(formData.selectedLibrary && formData.selectedExpression)
        );
      case "subGroup":
        // SubGroup : base fields and library + expression with characteristic description
        return (
          hasRequiredFields &&
          !!(
            evidenceVariableData.characteristicDescription &&
            evidenceVariableData.characteristicDescription.trim() &&
            formData.selectedLibrary &&
            formData.selectedExpression
          )
        );
      default:
        return false;
    }
  }, [
    evidenceVariableData.title,
    evidenceVariableData.description,
    formData.selectedLibrary,
  ]);

  /**
   * Handle save action
   */
  const handleSave = useCallback(() => {
    if (validateForm()) {
      return evidenceVariableData;
    }
    return null;
  }, [validateForm, evidenceVariableData]);

  ////////////////////////////////
  //         Actions            //
  ////////////////////////////////

  /**
   * Reset the form to its initial state
   */
  const resetForm = useCallback(() => {
    // Reset the EvidenceVariable data
    setEvidenceVariableData({
      id: initialEvidenceVariable?.id || "",
      status: initialEvidenceVariable?.status || "",
      identifier: initialEvidenceVariable?.identifier || "",
      title: initialEvidenceVariable?.title || "",
      description: initialEvidenceVariable?.description || "",
      isExcluded: initialEvidenceVariable?.isExcluded || false,
      characteristicDescription:
        initialEvidenceVariable?.characteristicDescription || "",
    });
    // Reset the other fields
    setFormData({
      selectedLibrary: initialFormData?.selectedLibrary,
      selectedExpression: initialFormData?.selectedExpression || "",
      selectedParameter: initialFormData?.selectedParameter || "",
      selectedComparator: initialFormData?.selectedComparator || "",
      criteriaValue: initialFormData?.criteriaValue,
    });
    setSelectedLibrary(null);
    setAvailableExpressions([]);
    setAvailableParameters([]);
  }, []);

  ////////////////////////////////
  //         Return             //
  ////////////////////////////////

  return {
    // Data
    evidenceVariableData,
    formData,
    libraries,
    selectedLibrary,
    availableExpressions,
    availableParameters,
    shouldLoadExpressions,
    shouldShowConditionalFields,
    // Handlers
    handleStatusChange,
    handleIdentifierChange,
    handleTitleChange,
    handleDescriptionChange,
    handleCharacteristicDescriptionChange,
    handleIsExcludedChange,
    handleLibraryChange,
    handleExpressionChange,
    handleParameterChange,
    handleCriteriaValueChange,
    handleLibrarySelectChange,
    handleParameterSelectChange,
    handleSave,
    // Validation & Reset
    validateForm,
    resetForm,
  };
};
