import { ChangeEvent, useState } from "react";
import { EvidenceVariableProps, InclusionCriteriaTypes } from "../types/evidenceVariable.types";

/**
 * Custom hook for managing Evidence Variable form state and handlers
 */
export const useEvidenceVariableForm = (initialData?: EvidenceVariableProps) => {
  // Form data state
  const [formData, setFormData] = useState<EvidenceVariableProps>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    expression: initialData?.expression || "",
    id: initialData?.id || "",
    criteriaValue: initialData?.criteriaValue || undefined,
  });

  // Criteria value state
  const [criteriaValue, setCriteriaValue] = useState<{
    type: InclusionCriteriaTypes;
    value?: any;
  }>({
    type: (initialData?.criteriaValue?.type as InclusionCriteriaTypes) || ("" as InclusionCriteriaTypes),
    value: initialData?.criteriaValue?.value || undefined,
  });

  /**
   * Handle title field change
   */
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  };

  /**
   * Handle description field change
   */
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };

  /**
   * Handle expression field change
   */
  const handleExpressionChange = (value: string) => {
    setFormData(prev => ({ ...prev, expression: value }));
  };

  /**
   * Handle criteria value change
   */
  const handleCriteriaValueChange = (value: {
    type: InclusionCriteriaTypes;
    value?: any;
  }) => {
    setCriteriaValue(value);
    setFormData(prev => ({ ...prev, criteriaValue: value }));
  };

  /**
   * Validate individual field
   */
  const validateField = (fieldName: string): boolean => {
    switch (fieldName) {
      case "title":
        return !!(formData.title && formData.title.trim());
      case "description":
        return !!(formData.description && formData.description.trim());
      default:
        return true;
    }
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    return !!(formData.title && formData.title.trim() && 
              formData.description && formData.description.trim());
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      expression: "",
      id: "",
      criteriaValue: undefined,
    });
    setCriteriaValue({
      type: "" as InclusionCriteriaTypes,
      value: undefined,
    });
  };

  return {
    // State
    formData,
    criteriaValue,
    
    // Handlers
    handleTitleChange,
    handleDescriptionChange,
    handleExpressionChange,
    handleCriteriaValueChange,
    
    // Validation
    validateField,
    validateForm,
    
    // Actions
    resetForm,
  };
};