# Legio Research IG (FHIR R5)

Run `sushi .` from this directory to generate the FHIR resources. The configuration follows `../ig/sushi-config.yaml`, with an R5 canonical and no R4 CQL binary path. `ig.ini` points IG Publisher at the generated ImplementationGuide and the base FHIR template; publishing requires that template to be available.

Source files are grouped by resource type. Each EvidenceVariable instance and the ResearchStudy template has its own FSH file. `input/fsh/StructureDefinition/EXT-Datamart.fsh` defines the extension used on ResearchStudy. Its canonical URL is `https://www.isis.com/StructureDefinition/EXT-Datamart`, matching the supplied ResearchStudy and the Legio application. The `variable` child refers to an EvidenceVariable; the optional `evaluation` child refers to a List produced by the datamart. A resulting List can reside in the R4 repository, as in the supplied ResearchStudy.

This R5 guide owns the EvidenceVariable, ResearchStudy and EXT-Datamart definitions. The sibling `../ig/` guide owns the R4 Patient, Observation, Questionnaire, QuestionnaireResponse and Library artifacts. The R5 EvidenceVariables refer to those R4 CQL Libraries by canonical URL. Test collections and their exact JSON request fixtures live in `../postman/`.
