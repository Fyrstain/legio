library LegioLabResearchVariables version '1.0.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers

codesystem "LOINC": 'http://loinc.org'

code "HbA1c": '4548-4' from "LOINC"
  display 'Hemoglobin A1c/Hemoglobin.total in Blood'

context Patient

define "gender":
    FHIRHelpers.ToString(Patient.gender)

define "birthDate":
    FHIRHelpers.ToDate(Patient.birthDate)

define "hba1c":
    First(
        [Observation: "HbA1c"] O
            where O.status = 'final'
            return O.value
    )