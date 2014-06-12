# Intro 

VizGrimoireJS aims at providing a framework for software metrics visualization using HTML, 
CSS and JavaScript as main technologies.

It was born as a complement to the outcomes of VizGrimoireR project (now GrimoireLib), 
whose main focus is to parse information from any of the tools found in Metrics Grimoire 
project.

## Q. What libraries are used by this front-end?

- Bootstrap 3.1.1
- Jasny Boostrap 3.1.3
- JQuery 1.11.1
- VizGrimoireJS-lib

## Q. How do I generate the HTML?

make

## Q. How do I clean the generated HTML?

make clean

## Q. Where do I include the JSON files?

Copy them to the directory browser/data/json

## Q. Where is the famous metrics.json file located?

It is located at browser/data/metrics.json

## Q. What if I don't want project support?

The project hierarchy is provided by the file browser/data/json/projects_hierarchy.json, if
the file is not present the dash works with no subprojects support.


