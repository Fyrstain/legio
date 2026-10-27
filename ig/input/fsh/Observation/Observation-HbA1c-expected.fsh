Instance: Observation-HbA1c-expected
InstanceOf: Observation
Description: "Expected HbA1c observation extracted from the example questionnaire response for LegioPatient1."
Usage: #example
* status = #final
* category[0].coding[0] = http://terminology.hl7.org/CodeSystem/observation-category#laboratory "Laboratory"
* code.coding[0] = http://loinc.org#4548-4 "Hemoglobin A1c/Hemoglobin.total in Blood"
* subject = Reference(LegioPatient1)
* valueQuantity.value = 6.2
* valueQuantity.unit = "%"
* valueQuantity.system = "http://unitsofmeasure.org"
* valueQuantity.code = #%
