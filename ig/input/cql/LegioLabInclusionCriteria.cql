library LegioLabInclusionCriteria version '1.0.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1' called FHIRHelpers

codesystem "LOINC": 'http://loinc.org'

code "HbA1c": '4548-4' from "LOINC"
  display 'Hemoglobin A1c/Hemoglobin.total in Blood'

context Patient

define "hasHbA1c":
    exists(
        [Observation: "HbA1c"] O
            where O.status = 'final'
    )

define "isIncluded":
    hasHbA1c
