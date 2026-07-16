<!-- Warning: This file is loaded automatically from the Template repository. 
Please do not make changes directly to the projects. 
For any update make the changes on a branch of the Template project -->

# ig-template-base by FYRSTAIN
package-id = fhir.base.template

Base IG template managed by HL7 but modified by FYRSTAIN.
This folder is used to update the graphic style of the different IGs offered by FYRSTAIN.

## Update graphic style

To simply modify the css style, color of elements for example, go to my-template/content/assets/css/fyr.css.

To change the layout of the pages, look for the files of the pages you want to modify in the includes and layout folders (in https://github.com/HL7/ig-template-base) modify them and put them in the my-template folder, keeping the same tree structure of base template.

## Follow the following steps to use this folder in your IG:
### 1. Command to add the link to the template repo:

- git remote -v

- git remote add upstream https://github.com/Fyrstain/Template.git

- git remote set-url --push upstream no_push

### 2. Command to retrieve the latest version of the style:

- git pull upstream main --allow-unrelated-histories

### 3. Change the template of the IG:

- In the ig.ini file at the root of the project, redefine the new IG template by replacing line 3 by "template = #my-template".

After adding the my-template folder, the IG will include the logo of HL7 FHIR and of the Fyrstain company as well as its graphic charter.
The includes and pagecontent folders have also been added, they allow to manage the layout of the Profiles and Extensions, Search Parameters and Operations, Capability Statements tabs, and the Examples tab.

## Command to load the latest version of the template when updates occurs:

- git fetch upstream
- git merge upstream/main

After that fix the conflicts and then commit the result.

**Note**: You can also retrieve a template from a branch in production by changing main with the name of the branch.
