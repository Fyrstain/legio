Instance: Observation-HbA1c-expected
InstanceOf: Observation
Usage: #example
* status = #final
* category[0].coding[0] = http://terminology.hl7.org/CodeSystem/observation-category#laboratory "Laboratory"
* code.coding[0] = http://loinc.org#4548-4 "Hemoglobin A1c/Hemoglobin.total in Blood"
* subject = Reference(LegioPatient1)
* valueQuantity.value = 6.2
* valueQuantity.unit = "%"
* valueQuantity.system = "http://unitsofmeasure.org"
* valueQuantity.code = #%
