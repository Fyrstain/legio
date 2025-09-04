// React
import { ChangeEvent, useState } from "react";
// Types
import { EvidenceVariableProps } from "../types/evidenceVariable.types";

/**
 * Custom hook to manage the form state for study variables.
 *
 * @param initialEvidenceVariable - The initial state of the evidence variable.
 * @returns The form state and handlers.
 */
export const useStudyVariableForm = (
  initialEvidenceVariable?: EvidenceVariableProps
) => {
    
  ////////////////////////////////
  //           States           //
  ////////////////////////////////

  const [evidenceVariableData, setEvidenceVariableData] =
    useState<EvidenceVariableProps>({
      id: initialEvidenceVariable?.id || "",
      title: initialEvidenceVariable?.title || "",
      description: initialEvidenceVariable?.description || "",
    });

  ////////////////////////////////
  //          Handlers          //
  ////////////////////////////////

  /**
   * Handle the change event for the title input.
   *
   * @param e The change event.
   */
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEvidenceVariableData((prev) => ({ ...prev, title: e.target.value }));
  };

  /**
   * Handle the change event for the description input.
   *
   * @param e The change event.
   */
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEvidenceVariableData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  ////////////////////////////////
  //       Validation           //
  ////////////////////////////////

  /**
   * Validate the form fields.
   *
   * @returns True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    return !!(
      evidenceVariableData.title?.trim() &&
      evidenceVariableData.description?.trim()
    );
  };

  /**
   * Reset the form fields to their initial values.
   */
  const resetForm = () => {
    setEvidenceVariableData({
      id: initialEvidenceVariable?.id || "",
      title: initialEvidenceVariable?.title || "",
      description: initialEvidenceVariable?.description || "",
    });
  };

  return {
    // Data
    evidenceVariableData,
    // Handlers
    handleTitleChange,
    handleDescriptionChange,
    // Validation & Reset
    validateForm,
    resetForm,
  };
};