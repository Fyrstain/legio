import { ChangeEvent, useState } from "react";
import {
  EvidenceVariableFormData,
  EvidenceVariableFormType,
  EvidenceVariableProps,
  InclusionCriteriaValue,
} from "../types/evidenceVariable.types";
import { LibraryReference } from "../types/library.types";

/**
 * Custom hook for managing Evidence Variable form state and handlers
 */
export const useEvidenceVariableForm = (
  formType: EvidenceVariableFormType,
  initialEvidenceVariable?: EvidenceVariableProps,
  initialFormData?: EvidenceVariableFormData
) => {
  ////////////////////////////////
  //           States           //
  ////////////////////////////////

  /**
   * To get the initial form data based on the form type
   *
   * @param formType can be "firstGroup", "inclusionCriteria", or "subGroup"
   * @returns the initial form data for the specified form type
   */
  const getInitialFormData = (): EvidenceVariableFormData => {
    switch (formType) {
      case "firstGroup":
        return {
          selectedLibrary: undefined,
        };
      case "inclusionCriteria":
        return {
          selectedLibrary: undefined,
          selectedExpression: "",
          selectedParameter: "",
          selectedComparator: "",
          criteriaValue: { type: "boolean", value: "" },
        };
      case "subGroup":
        return {
          selectedLibrary: undefined,
          selectedExpression: "",
          selectedParameter: "",
          selectedComparator: "",
          criteriaValue: { type: "boolean", value: "" },
        };
      default:
        return {};
    }
  };

  // State for the evidence variable data (business data)
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

  // Form data state
  const [formData, setFormData] = useState<EvidenceVariableFormData>(
    initialFormData || getInitialFormData()
  );

  ////////////////////////////////
  //          Handlers          //
  ////////////////////////////////

  /**
   * Handle status field change
   *
   * @param status is the new status value
   */
  const handleStatusChange = (status: string) => {
    setEvidenceVariableData((prev) => ({ ...prev, status }));
  };

  /**
   * Handle identifier field change
   */
  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEvidenceVariableData((prev) => ({
      ...prev,
      identifier: e.target.value,
    }));
  };

  /**
   * Handle title field change
   */
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEvidenceVariableData((prev) => ({ ...prev, title: e.target.value }));
  };

  /**
   * Handle description field change
   */
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEvidenceVariableData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  /**
   * Handle isExcluded field change
   *
   * @param isExcluded is the new isExcluded value
   */
  const handleIsExcludedChange = (isExcluded: boolean) => {
    setEvidenceVariableData((prev) => ({ ...prev, isExcluded }));
  };

  /**
   * Handle library change
   *
   * @param library is the new library reference
   */
  const handleLibraryChange = (library: LibraryReference) => {
    setFormData((prev) => ({
      ...prev,
      selectedLibrary: library,
      selectedExpression: "",
      selectedParameter: "",
    }));
  };

  /**
   * Handle expression change
   *
   * @param expression is the new expression value
   */
  const handleExpressionChange = (expression: string) => {
    setFormData((prev) => ({ ...prev, selectedExpression: expression }));
  };

  /**
   * Handle parameter change
   *
   * @param parameter is the new parameter value
   */
  const handleParameterChange = (parameter: string) => {
    setFormData((prev) => ({ ...prev, selectedParameter: parameter }));
  };

  /**
   * Handle criteria value change
   */
  const handleCriteriaValueChange = (value: InclusionCriteriaValue) => {
    setFormData((prev) => ({ ...prev, criteriaValue: value }));
  };

  /**
   * Handle the characteristic description change
   */
  const handleCharacteristicDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEvidenceVariableData((prev) => ({
      ...prev,
      characteristicDescription: e.target.value,
    }));
  };

  ////////////////////////////////
  //        Validations         //
  ////////////////////////////////

  /**
   * Validate individual field
   */
  const validateField = (fieldName: string): boolean => {
    switch (fieldName) {
      case "title":
        return !!(
          evidenceVariableData.title && evidenceVariableData.title.trim()
        );
      case "description":
        return !!(
          evidenceVariableData.description &&
          evidenceVariableData.description.trim()
        );
      default:
        return true;
    }
  };

  /**
   * Validate entire form according to formType
   */
  const validateForm = (): boolean => {
    return !!(
      evidenceVariableData.title &&
      evidenceVariableData.title.trim() &&
      evidenceVariableData.description &&
      evidenceVariableData.description.trim()
    );
  };

  ////////////////////////////////
  //          Actions           //
  ////////////////////////////////

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setEvidenceVariableData({
      identifier: "",
      title: "",
      description: "",
      id: "",
      status: "",
      isExcluded: false,
    });
    setFormData({
      selectedLibrary: undefined,
      selectedExpression: "",
      selectedParameter: "",
      selectedComparator: "",
      criteriaValue: undefined,
    });
  };

  return {
    // State
    evidenceVariableData,
    formData,

    // Init the form
    getInitialFormData,

    // Handlers
    handleIdentifierChange,
    handleTitleChange,
    handleDescriptionChange,
    handleStatusChange,
    handleIsExcludedChange,
    handleLibraryChange,
    handleExpressionChange,
    handleParameterChange,
    handleCriteriaValueChange,
    handleCharacteristicDescriptionChange,

    // Validation
    validateField,
    validateForm,

    // Actions
    resetForm,
  };
};
