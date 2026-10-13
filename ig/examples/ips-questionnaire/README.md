# LEG-224 - IPS Questionnaire workflow

Target workflow: QuestionnaireResponse -> $extract -> laboratory Observation -> IPS -> Legio study.

The Questionnaire, QuestionnaireResponse, $extract Parameters request and expected HbA1c Observation are versioned in this folder.

The questionnaire-engine endpoint is configurable in the Postman collection. The currently identified Fyrstain endpoints were not reachable during validation, so the live $extract and IPS generation could not be validated.

The Postman workflow performs: $extract -> create/update Patient -> create/update extracted Observation -> Patient/$summary.

The dataServer and documentServer endpoints are configurable. Live execution is not validated because no reachable Chambéry/BOW Medical environment is currently available.

To reuse the HbA1c Observation in the LEG-223 study, run this collection first, then run examples/legio-lab-study/LegioLabStudy.postman_collection.json with useExistingPatient1Observation=true. The study will keep the Observation created from the QuestionnaireResponse instead of replacing it with its static fixture.
