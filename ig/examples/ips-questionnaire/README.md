# LEG-224 - IPS Questionnaire workflow

Target workflow: QuestionnaireResponse -> $extract -> laboratory Observation -> IPS -> Legio study.

The Questionnaire, QuestionnaireResponse, $extract Parameters request and expected HbA1c Observation are versioned in this folder.

The live `$extract` operation was validated against `https://had.sandbox-chms.fyrstain.com/fhir`. It successfully produces a final laboratory Observation for `Patient/LegioPatient1` with LOINC `4548-4` and value `6.2 %`.

The Postman workflow performs: `$extract` -> create/update Patient -> create/update extracted Observation -> `Patient/$summary`.

IPS generation could not be validated on the available sandbox because `Patient/$summary` is not exposed by its FHIR CapabilityStatement and returns `400 not-supported`. The legacy questionnaire processor at `https://integ.fyrstain.com/r4/questionnaire-processor` also returns a server-side HAPI 500/NPE for `$extract`; the CHMS sandbox endpoint must therefore be used for the validated extraction flow.

The extracted HbA1c Observation was successfully reused by the LEG-223 study using `useExistingPatient1Observation=true`. The complete Legio cohorting and datamart workflow passed with 50/50 assertions, including two patients and the expected gender, birth date and HbA1c research variables.

The `dataServer` and `documentServer` endpoints are configurable. The Chambéry IG is available as implementation documentation, but no validated Chambéry/BOW Medical runtime endpoint is available for this workflow, so that integration is documented but not executed end-to-end.

To reproduce the validated Legio part, run this collection first with the CHMS sandbox endpoint, then run `examples/legio-lab-study/LegioLabStudy.postman_collection.json` with `useExistingPatient1Observation=true`. The study will keep the Observation created from the QuestionnaireResponse instead of replacing it with its static fixture.
