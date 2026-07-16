# Legio IG

## Pré-requis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

* [Node.js](https://nodejs.org/) (version recommandée : >= 14.x)
* [Java JDK](https://adoptopenjdk.net/) (version recommandée : >= 11)
* [Jekyll](https://jekyllrb.com/)

### Installation de Nodejs

Reportez-vous à la page d'installation de [nodejs](https://nodejs.org/fr/download).

Sous Linux, il est conseillé de s'appuyer sur le programme [nvm](https://github.com/nvm-sh/nvm) (pour Node Version Manager) vous permettant de gérer facilement plusieurs versions de Nodejs sur votre poste de travail.
Vous pouvez alors suivre la [documentation d'installation de nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating).

Vous pourrez alors installer une version de nodejs de cette façon : 

```bash
nvm install --lts       # Installe la dernière version LTS de Nodejs
nvm alias default node  # Utilise par défaut la dernière version installée de Nodejs
```

### Installation de Java JDK

Vous devez installer un JDK pour utiliser cet IG. Pour ce faire, vous pouvez vous référer à la documentation d'[OpenJDK](https://openjdk.org/index.html).

Sous Linux, vous pouvez utiliser votre gestionnaire de paquet local. Par exemple, sous Ubuntu : 

```bash
sudo apt install openjdk-21-jdk openjdk-21-jre
```

### Installation de Jekyll

La génération de page web statiques du guide d'implémentation est réalisée à l'aide de Jekyll. Ce dernier a une dépendance à Ruby et GCC, comme indiqué dans sa [page d'installation](https://jekyllrb.com/docs/installation/).

Sous Ubuntu, vous pouvez l'installer de cette façon : 

```bash
sudo apt-get install ruby-full build-essential zlib1g-dev # Installation des dépendances
```

Puis, ajouter les variables d'environnement à votre `~/.bashrc` : 

```bash
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Enfin, installer Jekyll et Bundler : 

```bash
gem install jekyll bundler # Installation de Jekyll
```

### Installation de FSH-SUSHI

Pour installer [FHIR ShortHand (FSH)](https://www.hl7.org/fhir/uv/shorthand/) et [SUSHI](https://github.com/FHIR/sushi), vous pouvez vous référer à la [documentation](https://github.com/FHIR/sushi?tab=readme-ov-file#sushi-user-instructions).

Voici la commande pour installer FSH et SUSHI : 

```bash
npm install -g fsh-sushi
```

## Installation de l'IG Publisher

L'IG Publisher est l'outil principal pour compiler et publier un guide d'implémentation FHIR. Vous devez lancer le script `_updatePublisher.sh` (ou `.bat` si vous êtes sous Windows).

Ce script installera le jar `publisher.jar` contenant l'IG Publisher dans le dossier `input-cache`. Il installera également et vous proposera de mettre à jour les scripts liés à l'IG Publisher.

## Compiler avec SUSHI

[SUSHI](https://fshschool.org/docs/sushi/) est utilisé pour transformer les fichiers FSH en ressources FHIR.  

Pour compiler les fichiers FSH du projet :

```bash
sushi .
```

## Compiler l'IG

Pour compiler l'entièreté du guide d'implémentation avec l'IG Publisher, vous pouvez utiliser le script `_genonce.sh` (ou `.bat` sous Windows).

```bash
./_genonce.sh
```

Ce script va lancer la compilation avec SUSHI, puis lancera la génération de l'ensemble des artéfacts et des pages webs composants le Guide d'Implémentation. Le résultat sera généré dans le dossier `output`.

## Afficher le contenu de l'IG

Ouvrez le fichier `output/index.html` dans votre navigateur pour consulter le guide d'implémentation généré.

## Anatomie de l'IG

L'IG est structuré de la façon suivante :

* `input/`: contient les fichiers sources (FSH, images, pages markdown)
* `fsh-generated/`: généré par SUSHI, contient les ressources FHIR
* `output/`: résultat final du guide compilé, avec les pages web statiques
* `ig.ini`: fichier de configuration principal de l'IG
* `sushi-config.yaml` : fichier de configuration lié à SUSHI

Consultez la documentation de chaque dossier pour plus de détails sur leur contenu et leur rôle.

---

# Implementation Guide Template (English)

This Implementation Guide (IG) template contains the bare minimum you need to implement an interoperability use case. It includes instructions for installing and using the IG in both French and English.

## Prerequisites

Before you begin, make sure you have installed the following:

* [Node.js](https://nodejs.org/) (recommended version: >= 14.x)
* [Java JDK](https://adoptopenjdk.net/) (recommended version: >= 11)
* [Jekyll](https://jekyllrb.com/)

### Installing Node.js

Refer to the [Node.js installation page](https://nodejs.org/en/download).

On Linux, it is recommended to use [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) to easily manage multiple Node.js versions on your workstation.
You can follow the [nvm installation documentation](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating).

You can then install a Node.js version as follows:

```bash
nvm install --lts       # Installs the latest LTS version of Node.js
nvm alias default node  # Uses the latest installed version of Node.js by default
```

### Installing Java JDK

You need to install a JDK to use this IG. Refer to the [OpenJDK documentation](https://openjdk.org/index.html).

On Linux, you can use your local package manager. For example, on Ubuntu:

```bash
sudo apt install openjdk-21-jdk openjdk-21-jre
```

### Installing Jekyll

Static web page generation for the implementation guide is done using Jekyll. Jekyll depends on Ruby and GCC, as indicated in its [installation page](https://jekyllrb.com/docs/installation/).

On Ubuntu, you can install it as follows:

```bash
sudo apt-get install ruby-full build-essential zlib1g-dev # Install dependencies
```

Then, add the environment variables to your `~/.bashrc`:

```bash
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Finally, install Jekyll and Bundler:

```bash
gem install jekyll bundler # Install Jekyll
```

### Installing FSH-SUSHI

To install [FHIR ShortHand (FSH)](https://www.hl7.org/fhir/uv/shorthand/) and [SUSHI](https://github.com/FHIR/sushi), refer to the [documentation](https://github.com/FHIR/sushi?tab=readme-ov-file#sushi-user-instructions).

Here is the command to install FSH and SUSHI:

```bash
npm install -g fsh-sushi
```

## Installing the IG Publisher

The IG Publisher is the main tool for compiling and publishing a FHIR implementation guide. You need to run the `_updatePublisher.sh` script (or `.bat` if you are on Windows).

This script will install the `publisher.jar` containing the IG Publisher in the `input-cache` folder. It will also install and offer to update scripts related to the IG Publisher.

## Compile with SUSHI

[SUSHI](https://fshschool.org/docs/sushi/) is used to transform FSH files into FHIR resources.

To compile the project's FSH files:

```bash
sushi .
```

## Compile the IG

To compile the entire implementation guide with the IG Publisher, use the `_genonce.sh` script (or `.bat` on Windows).

```bash
./_genonce.sh
```

This script will run the SUSHI compilation, then generate all artifacts and web pages that make up the Implementation Guide. The result will be generated in the `output` folder.

## View the IG Content

Open the `output/index.html` file in your browser to view the generated implementation guide.

## IG Anatomy

The IG is structured as follows:

* `input/`: contains source files (FSH, images, markdown pages)
* `fsh-generated/`: generated by SUSHI, contains FHIR resources
* `output/`: final compiled guide, with static web pages
* `ig.ini`: main configuration file for the IG
* `sushi-config.yaml`: configuration file for SUSHI

See the documentation for each folder for more details about their content and role.
