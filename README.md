# Legio
Description : React front application for cohorting and datamart. 

## Prerequisites

Note: Please ensure you have installed <code><a href="https://nodejs.org/en/download/">node js</a></code>

To preview and run the project on your device:
1) Open project folder in <a href="https://code.visualstudio.com/download">Visual Studio Code</a>
2) In the terminal, run `npm install`
3) Run `npm run build` to retrieve images from the library
4) Run `npm start` to view project in browser

For more information on integrating Nexus with our Maven, npm and Docker projects, please see the Nexus integration guide : <a href="https://github.com/Fyrstain/swf-infrastructure/blob/init/nexus/README.md">Nexus ReadMe</a>

## Retrieving a component added to the library

When a component has just been added to the library to be able to use it :
1) In the package.json file put the same version as in the library (@fyrstain/fhir-front-library)
2) In the terminal, run `npm i --force`
3) Run `npm start` to view project in browser

## Modify the style of a library component

1) Add the corresponding className in the component use in the page (See the one proposed by the component in the library)
2) Adding the class to the corresponding css file

## Change the value of css variables

1) Open the style.css file
2) change the value of the variables.
  
## Configuration via environment variables

The following environment variables are available to configure the application :

- **PORT**: Used to configure the internal port that the application will listen on.
- **REACT_APP_FHIR_URL**: Address of the FHIR Backend for the application.
- **REACT_APP_DISPLAY_CLIENT_LOGO**: If true, display the client logo in the footer. Uses public/assets/client_logo.jpg.
- **REACT_APP_KEYCLOAK_URL**: Address of the Keycloak.
- **REACT_APP_REDIRECTURI**: Redirection URI after connection.
- **REACT_APP_KEYCLOAK_REALM**: Keycloak realm to be used.
- **REACT_APP_KEYCLOAK_REALM_CLIENT_ID**: Client ID to use inside the realm.
- **REACT_APP_KEYCLOAK_FLOW**: Authentication flow used by Keycloak.
- **REACT_APP_KEYCLOAK_ONLOAD**: Specifies an action to do on load.
- **REACT_APP_KEYCLOAK_CHECKSSO_LOGIN_IFRAME**: Set to enable/disable monitoring login state.
- **REACT_APP_KEYCLOAK_CHECKSSO_FALLBACK**: Specifies whether the silent check-sso should fallback to "non-silent" check-sso when 3rd party cookies are blocked by the browser.
- **REACT_APP_KEYCLOAK_PKCE_METHOD**: Configures the Proof Key for Code Exchange (PKCE) method to use.

## Docker configuration files

There is 4 different Docker configuration files for this project :

- `.env`
- `Dockerfile`
- `docker-compose-kc-only.yml`
- `docker-compose.yml`

### Default environment files

Default environment files is named `.env`. It is designed as a template for your environment needs. It contains all the
environment variable that can be defined with example values.

⚠️ Note that this template is used to set up default values for environment variables in the Docker image when using
the provided docker-compose files and Docker commands ⚠️

### Dockerfile

The file used to build images is `Dockerfile`.

The Dockerfile allows to set default values for each environment variable using arguments. Every argument is prefixed with
`ARG_`. This way, the `PORT` variable can be set to false by default using the build argument `ARG_PORT`.

ℹ️ Note that provided docker-compose and Docker commands use this in combination with the .env files to set default
values for environment variables inside each Docker image ℹ️

### docker-compose files

This project contains two docker-compose files :
- `docker-compose.yml`
- `docker-compose-kc-only.yml`

The compose file named `docker-compose.yml` contains both the image for the application and the image for the Keycloak used for authentication. It is designed to build
a new image for the front application or use the latest.
It is designed to use `.env` file for default environment variable.

The compose file named `docker-compose-kc-only.yml` contains only the image for the Keycloak used for authentication.
It will also use `.env` file for environment variable.

## Running the application using Docker

You can run the application using Docker. To do so you can use the docker-compose file that can
be found at root level of the project. The file is designed to build the Docker image from the current repository.

The command to use in order to start the application is the following :

```bash
docker compose up -d 
```

The _up_ command start all the container defined in your docker-compose. The _-d_ option makes it so that is
done in the background.

If you want to force the build of the image, use the following command :

```bash
docker build -t docker.registry.fyrstain.com/pandora/front:latest --secret id=npmrc,src=C:/Users/wylem/.npmrc --build-arg ARG_PORT=3000 --build-arg ARG_REACT_APP_FHIR_URL=http://localhost:8080/fhir --build-arg ARG_REACT_APP_DISPLAY_CLIENT_LOGO=false --build-arg ARG_REACT_APP_KEYCLOAK_URL=http://localhost:8999/ --build-arg ARG_REACT_APP_REDIRECTURI=http://localhost:3000/ --build-arg ARG_REACT_APP_KEYCLOAK_REALM=demo --build-arg ARG_REACT_APP_KEYCLOAK_REALM_CLIENT_ID=pandora-demo --build-arg ARG_REACT_APP_KEYCLOAK_FLOW=standard --build-arg ARG_REACT_APP_KEYCLOAK_ONLOAD=check-sso --build-arg ARG_REACT_APP_KEYCLOAK_CHECKSSO_LOGIN_IFRAME=false --build-arg ARG_REACT_APP_KEYCLOAK_CHECKSSO_FALLBACK=false --build-arg ARG_REACT_APP_KEYCLOAK_PKCE_METHOD=S256 --no-cache .
```

The _build_ command build all images as defined in the docker-compose file. The _--no-cache_ option forces a new
build without using the cache.

If you want to use the development server to access hot reload, you can use the `docker-compose-kc-only.yml` to deploy your Keycloak using the command :

```bash
docker compose -f docker-compose-kc-only.yml up -d 
```

And then, deploy the application with the usual :

```bash
npm run start
```

## Deployed images

Deployed images are composed of the front application front available on http://localhost:3000 and the Keycloak which is accessible on http://localhost:8999. 
The default credentials for the administration console are :
- Username: `admin` 
- Password: `admin`

### Import / Export Realm with KC

It is recommended when you test a specific environment, that you export/import realm + users json file so you can better reproduce this environment behavior.
Once the realm is exported, the json file is to be put in the `import` folder. 

ℹ️ By default a demo realm import is made with 1 verified user already created :
- Username: `john.doe@gmail.com` 
- Password: `azerty`.
 ℹ️

The import is then made into your Keycloak with the `docker-compose.yml`:

```
    entrypoint: /opt/keycloak/bin/kc.sh start-dev --import-realm
    volumes:
      - ./import:/opt/keycloak/data/import
```

You should be able to use the users of the realm after the import.
