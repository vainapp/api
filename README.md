# back-end

This project is our main API that encompasses our website, app and administrative system.

## Getting Started

These instructions will give you a copy of the project up and running on
your local machine for development and testing purposes. See deployment
for notes on deploying the project on a live system.

### Prerequisites

Requirements for the software and other tools to build, test and push
- [Node.js](https://nodejs.org/en/)
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Docker & Docker Compose](https://www.notion.so/Instalando-Docker-6290d9994b0b4555a153576a1d97bee2)
- [Sequelize CLI intalled globally](https://www.npmjs.com/package/sequelize-cli)

### Installing

A step by step series of examples that tell you how to get a development
environment running

Install the dependencies

    npm install

Start the databases with Docker

    docker-compose -f docker-compose.local.yml up -d

Clone `.env.example` to `.development.env` and ask [@joaopcm](https://github.com/joaopcm) for AWS credentials

Run the database migrations

    npm run sequelize-cli db:migrate --url postgresql://postgres:postgres@localhost:5432/grupoc

Start the API

    npm run server:dev

Start the queue

    npm run queue:dev

After following these steps, you should be able to access the API at
`http://localhost:3333`

![CleanShot 2023-01-25 at 10 41 17](https://user-images.githubusercontent.com/58827242/214578916-16246f91-9910-4120-9ff6-be210486def1.png)

## Running the tests

We use Jest in our tests. By default, we have only service tests, thus testing 100% of our business rules.

Stop local databases

    docker-compose -f docker-compose.local.yml down

Start test databases

    docker-compose -f docker-compose.test.yml up -d

Run the tests

      npm run test

https://user-images.githubusercontent.com/58827242/214584318-9ddd3fbf-baf6-48d8-ae44-1e79c671891b.mp4

> 🚧 **Pay attention**
>
> If you're running the tests locally, you'll need to update the `.env.test` file replacing all the environment variables ending with `_HOST` to `localhost`. For example, `DB_HOST=redis` should be `DB_HOST=localhost`.
>
> **REMEBER TO CHANGE IT BACK BEFORE COMMITING**

## Creating migrations

We use [Sequelize](https://sequelize.org/) to manage our database migrations. To create a new migration, run the following command:

    npm run sequelize-cli migration:generate --name <migration name here>

## Deployment

Our deployment is done automatically through our CI/CD infrastructure using GitHub Actions. The process is summarized in a few steps:

1. When you open a PR, we run the [Tests workflow](https://github.com/vainapp/back-end/blob/develop/.github/workflows/test.yml) (you can only merge a PR if the tests pass);
2. When merge a PR in the `develop` branch, the [Semantic release workflow](https://github.com/vainapp/back-end/blob/develop/.github/workflows/release.yml) is executed together with the [Tests workflow](https://github.com/vainapp/back-end/blob/develop/.github/workflows/test.yml), thus generating a new release version.
3. At the end of the [Semantic release workflow](https://github.com/vainapp/back-end/blob/develop/.github/workflows/release.yml), the [Development deployment workflow](https://github.com/vainapp/back-end/blob/develop/.github/workflows/deploy-development.yml) is started, thus performing the deployment on our Digital Ocean servers;

## Contributing

Understand how our Git flow works.

### Developing new features
```mermaid
gitGraph
   commit
   branch develop
   commit
   branch issue-1
   checkout issue-1
   commit
   commit
   checkout develop
   merge issue-1 tag:"v1.0.0"
   checkout main
   merge develop
   checkout develop
   branch issue-2
   commit
   commit
   checkout develop
   merge issue-2 tag:"v1.1.0"
   checkout main
   merge develop
```

### Fixing bugs
```mermaid
gitGraph
   commit
   branch develop
   checkout develop
   commit
   commit
   checkout main
   merge develop tag:"v1.1.1"
   branch  issue-3
   checkout  issue-3
   commit id:"fix-commit"
   checkout main
   merge issue-3 tag:"v1.1.2"
   checkout develop
   cherry-pick id:"fix-commit"
```

## Versioning

We use [Semantic Versioning](http://semver.org/) for versioning. For the versions
available, see the [tags on this
repository](https://github.com/vainapp/back-end/tags).
