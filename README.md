# A simple startershell project using node.js & mongo

Table of Contents
=================

   * [Simple micro-service](#simple-micro-service)
   * [Table of Contents](#table-of-contents)
      * [Project description](#project-description)
      * [Starting the service](#starting-the-service)
      * [Features](#features)
         * [Configuration](#configuration)
         * [Swagger documentation](#swagger-documentation)
         * [Endpoint validation](#endpoint-validation)
         * [Logging](#logging)
         * [Database](#database)
         * [Docker](#docker)
         * [Docker Compose](#docker-compose)
         * [Minikube](#minikube)
         * [Linting](#linting)
         * [Testing](#testing)

## Project description

A template management system. This is a proof of concept. Entities are categories and templates. 
Each category or template can belong to an existing category. This micro-service exposes API for:
 * create a template
 * create a category
 * move a template to a category
 * move a category to another category
 * delete a template
 * delete a category - it will delete all child categories and templates recursively.

## Starting the service

 * Clone project locally
 
`git clone git@github.com:mirceaalexandru/startershell-mongo.git`

 * Prepare configuration: 
   * Copy `.env_sample` as `.env`. Change any environment variable to match your environment configuration.
   * Copy `.env-variables.sample` as `env-variables.env`. Change any environment variable to match your environment configuration. This file contains the configuration required by docker-compose.

 You can start you service in one of these 4 ways:
 * Start your service using an external Mongo replicaset. Just need to provide correct DB URI in `.env` (or as environment variable).
 * Start your service using the MongoDB replicaset started with docker-compose. You need to start docker-compose (`docker-compose up --build --scale service=0`) and then you can start your service on local host. This will start multiple Mongo nodes and configure them as replicaset.
 * Start your service and MongoDB using docker-compose. You can start docker compose (`docker-compose up --build`). This will start multiple Mongo nodes, configure them as replicaset and then start the service. 

## Features

### Configuration

 * Configuration is loaded from environment variables.
 * Support for loading from an `.env` file is provided. However the `dotenv` is added as dev dependency making sure that `.env` is not loaded in production as this will be a bad practice.
 * Before service is started a strict schema validation is applied on configuration object. This is required to make sure the application is started with a valid configuration, at least from structure point of view.
 * There are no configuration defaults. This will enforce creating proper environment variables for all configuration parameters.
 
### Swagger documentation

 * Swagger documentation for implemented API is exposed automatically on `/documentation` endpoint.
 * This documentation is created automatically using the HapiJs endpoint validation so is up-to-date and automatically updated when API is changed.
 * This documentation is exposed automatically only for `development` environments, in `staging` or `production` it will no exposed API documentation. 
 * Project can be started also using minikube.
 
### Endpoint validation

 * All endpoints have a strict validation implementing using JOI.
 * This implementation will be automatically described in the Swagger documentation.
 * Validation errors details are not exposed in the HTTP response. The validation error reason is only exposed in log.
 
### Logging

 * Logging is done using 'hapi-pino', one of the fastest logger available for HapiJs.
 * Logger uses a pretty log style only in development environments.
 
### Database

MongoDB is used for this project. Because I wanted to use transactions I needed to use a Mongo replicaset.
The docker-compose provided in this project is creating the required MongoDB replicaset.

### Docker

Docker files are provided for:
 * development environment - `Dockerfile.dev`. This is using nodemon for automatically reloading the service when changes are made.
 * production environment - `Dockerfile`

### Docker Compose

A docker compose is provided. This docker compose contains our service and also a MongoDB replicaset. The docker-compose will:
 * start multiple Mongo nodes
 * configure them as a replicaset
 * start service
 
### Minikube

The project can also be started using minikube. The instructions are available here (TBD).
 
### Linting

Please run `npm run lint` for linting.

### Testing

Please run `npm run test` for running both integration and unit tests. ATM only integration tests are provided.

