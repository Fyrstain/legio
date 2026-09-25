Legio Lab Study - Legio Laboratory Study Postman collection

This collection reproduces the validated Legio Lab Study scenario on a clean FHIR/Legio environment.

Import Legio Lab Study-LegioLab.postman_collection.json into Postman. Optionally import Legio Lab Study-DEV.postman_environment.json for the current DEV endpoints. For another environment, change the server variables before running.

Run the folders in order: example data, knowledge artifacts, study deployment, then workflow verification. The collection deploys two Patients and two final HbA1c Observations, two Libraries containing CQL + ELM, the inclusion and research EvidenceVariables, the dataset EvidenceVariable, then the ResearchStudy template and initial instance. It finally runs $cohorting and $generate-datamart.

Expected result: the cohort contains exactly 2 patients. The datamart contains two Parameters resources with gender, birthDate, and hba1c, with values female / 1981-03-15 / 6.2% and male / 1964-08-22 / 7.4%. The final ResearchStudy is post-datamart, references Group/group-RS-LegioLabStudy, and its EXT-Datamart evaluation points to the generated List.

Note: the template request uses POST to match the validated FLUTE/Legio flow. Run it on a clean target environment, or remove older Legio Lab Study templates before re-running to avoid accumulating template resources with the same canonical URL.