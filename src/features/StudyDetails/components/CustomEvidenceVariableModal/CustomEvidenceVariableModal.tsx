// // React
// import { FunctionComponent, useCallback, useState } from "react";
// // React Bootstrap
// import { Modal, Button, Form } from "react-bootstrap";
// // Translation
// import i18n from "i18next";
// // HL7 Front library
// import { Title } from "@fyrstain/hl7-front-library";
// // Types
// import {
//   EvidenceVariableProps,
//   EvidenceVariableFormData,
//   EvidenceVariableType,
//   ModalMode,
//   EvidenceVariableLogicType,
//   EvidenceVariableFormType,
// } from "../../types/evidenceVariable.types";
// // Components
// import FirstGroupForm from "./Forms/FirstGroupForm";
// import InclusionCriteriaForm from "./Forms/InclusionCriteriaForm";
// import SubGroupForm from "./Forms/SubGroupForm";
// // Hook
// import { useStudyVariableForm } from "../../hooks/useStudyVariableForm";
// import BaseEvidenceVariableForm from "./Forms/BaseEvidenceVariableForm";

// ////////////////////////////////
// //           Props            //
// ////////////////////////////////

// interface CustomEvidenceVariableModalProps {
//   // to show or hide the modal
//   show: boolean;
//   // to hide the modal
//   onHide: () => void;
//   // to save the evidence variable
//   onSave?: (evidenceVariable: EvidenceVariableProps) => void;
//   // existing evidence variable to update, or undefined for creation
//   evidenceVariable?: EvidenceVariableProps;
//   // initial form data for the modal
//   initialFormData?: EvidenceVariableFormData;
//   // mode of the modal, either create or update
//   mode?: ModalMode;
//   // type of the evidence variable, either inclusion or study
//   evidenceVariableType?: EvidenceVariableType;
//   // to distinguish between the different forms for the inclusion criteria (firstGroup, inclusionCriteria, subGroup)
//   formType?: EvidenceVariableFormType;
//   // logic type for the evidence variable, either XOR, OR, or AND
//   logicType?: EvidenceVariableLogicType;
// }

// const CustomEvidenceVariableModal: FunctionComponent<
//   CustomEvidenceVariableModalProps
// > = ({
//   show,
//   onHide,
//   onSave,
//   evidenceVariable,
//   initialFormData,
//   mode,
//   evidenceVariableType,
//   formType,
//   logicType,
// }) => {
//   ////////////////////////////////
//   //           State            //
//   ////////////////////////////////

//   // Use of the Study Variables hooks
//   const {
//     evidenceVariableData: initialStudyData,
//     handleTitleChange,
//     handleDescriptionChange,
//     validateForm: validateStudyForm,
//     resetForm: resetStudyForm,
//   } = useStudyVariableForm(evidenceVariable);

//   // Local state for studyData to allow setStudyData
//   const [studyData, setStudyData] = useState(initialStudyData);

//   // State for managing sub-form handlers
//   const [formHandlers, setFormHandlers] = useState<{
//     save: () => boolean;
//     reset: () => void;
//   } | null>(null);

//   ////////////////////////////////
//   //          Actions           //
//   ////////////////////////////////

//   /**
//    * Generate dynamic modal title based on context
//    */
//   const generateModalTitle = (): string => {
//     // Generate action text based on mode (Create or Update)
//     const actionText =
//       mode === "create" ? i18n.t("title.add") : i18n.t("title.update");
//     // Handle study variables titles
//     if (evidenceVariableType === "study") {
//       return `${actionText} ${i18n.t("title.astudyvariable")}`;
//     }
//     // Handle inclusion criteria and sub-group titles based on form type
//     switch (formType) {
//       case "firstGroup":
//         return `${actionText} ${i18n.t("title.thefirstgroup")} ${
//           logicType ?? ""
//         }`;
//       case "inclusionCriteria":
//         const includeText =
//           mode === "create" ? i18n.t("title.add") : actionText;
//         return `${includeText} ${i18n.t("title.aninclusioncriteria")} ${
//           logicType ?? ""
//         }`;
//       case "subGroup":
//         return `${actionText} ${i18n.t("title.asubgroup")} ${logicType ?? ""}`;
//       default:
//         return `${actionText} ${i18n.t("title.aninclusioncriteria")}`;
//     }
//   };

//   /**
//    * Handle form submission
//    */
// //   const handleSave = useCallback(() => {
// //     if (evidenceVariableType === "study") {
// //       if (validateStudyForm()) {
// //         onSave?.(studyData);
// //         onHide();
// //       }
// //     } else {
// //       const success = formHandlers?.save();
// //       if (success) {
// //         onHide();
// //       }
// //     }
// //   }, [
// //     evidenceVariableType,
// //     validateStudyForm,
// //     studyData,
// //     onSave,
// //     onHide,
// //     formHandlers,
// //   ]);

//   const handleSave = useCallback(() => {
//     console.log("Modal handleSave called", {
//       evidenceVariableType,
//       formHandlers,
//     });

//     if (evidenceVariableType === "study") {
//       console.log("Study data:", studyData);
//       if (validateStudyForm()) {
//         onSave?.(studyData);
//         onHide();
//       }
//     } else {
//       console.log("Inclusion criteria path", formHandlers);
//       if (!formHandlers) {
//         console.error("formHandlers is null!");
//         return;
//       }
//       const success = formHandlers.save();
//       console.log("Save result:", success);
//       if (success) {
//         onHide();
//       }
//     }
//   }, [
//     evidenceVariableType,
//     formHandlers,
//     validateStudyForm,
//     studyData,
//     onSave,
//     onHide,
//   ]);

//   /**
//    * Handle modal close
//    */
//   const handleClose = () => {
//     onHide();
//   };

//   /**
//    * Handle reset action
//    */
//   const handleReset = () => {
//     if (evidenceVariableType === "study") {
//       // Reset for study variables via the hook
//       resetStudyForm();
//     } else {
//       // Delegation to sub-forms
//       formHandlers?.reset();
//     }
//   };

//   /**
//    * Handle when sub-forms are ready and expose their handlers
//    */
//   const handleFormReady = useCallback(
//     (handlers: { save: () => boolean; reset: () => void }) => {
//       setFormHandlers(handlers);
//     },
//     []
//   );

//   /////////////////////////////////////////////
//   //                Content                  //
//   /////////////////////////////////////////////

//   return (
//     <Modal show={show} onHide={handleClose} size="lg" centered>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           <Title level={2} content={generateModalTitle()} />
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {evidenceVariableType === "study" && (
//           <>
//             <BaseEvidenceVariableForm
//               data={studyData}
//               onChange={(newData) => setStudyData(newData)}
//               readonly={false}
//             />
//           </>
//         )}

//         {evidenceVariableType === "inclusion" && (
//           <>
//             {formType === "firstGroup" && (
//               <FirstGroupForm
//                 formType={formType}
//                 initialEvidenceVariable={evidenceVariable}
//                 initialFormData={initialFormData}
//                 // onFormReady={handleFormReady}
//                 // onSave={onSave}
//               />
//             )}
//             {formType === "inclusionCriteria" && (
//               <InclusionCriteriaForm
//                 formType={formType}
//                 initialEvidenceVariable={evidenceVariable}
//                 initialFormData={initialFormData}
//                 onFormReady={handleFormReady}
//                 onSave={onSave}
//               />
//             )}
//             {formType === "subGroup" && (
//               <SubGroupForm
//                 formType={formType}
//                 initialEvidenceVariable={evidenceVariable}
//                 initialFormData={initialFormData}
//                 logicType={logicType}
//                 onFormReady={handleFormReady}
//                 onSave={onSave}
//               />
//             )}
//           </>
//         )}
//       </Modal.Body>

//       {/* Modal Footer with Save and Reset buttons */}
//       <Modal.Footer>
//         <Button variant="primary" onClick={handleSave}>
//           {i18n.t("button.save")}
//         </Button>
//         <Button variant="secondary" onClick={handleReset}>
//           {i18n.t("button.reset")}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default CustomEvidenceVariableModal;