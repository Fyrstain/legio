// This is a simple example of a FSH file.
// This file can be renamed, and additional FSH files can be added.
// SUSHI will look for definitions in any file using the .fsh ending.
// Profile: MyPatient
// Parent: Patient
// Description: "An example profile of the Patient resource."
// * name 1..* MS

// Instance: PatientExample
// InstanceOf: MyPatient
// Description: "An example of a patient with a license to krill."
// * name
//   * given[0] = "James"
//   * family = "Pond"
Profile: MyPatient
Parent: Patient
Description: "Patient used for the Legio cohorting demonstration."
* name 1..* MS

Instance: LegioPatient1
InstanceOf: MyPatient
Usage: #example
* identifier.system = "https://legio.test/patients"
* identifier.value = "PATIENT-001"
* name.family = "Martin"
* name.given = "Alice"
* gender = #female
* birthDate = "1981-03-15"

Instance: LegioPatient2
InstanceOf: MyPatient
Usage: #example
* identifier.system = "https://legio.test/patients"
* identifier.value = "PATIENT-002"
* name.family = "Durand"
* name.given = "Bob"
* gender = #male
* birthDate = "1964-08-22"