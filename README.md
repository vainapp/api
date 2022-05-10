# centauri
Our back-end service.

## Setup

First, make sure you're using the right Node.js version with:
```sh
nvm use
```

Then, start all the required databases with the following command:
```sh
docker-compose up -d
```

If this is the very first time you're running this app, consider running all the migrations in your local database with:
```sh
yarn sequelize-cli db:migrate --url postgresql://postgres:postgres@localhost:5432/gymc
```

Copy the content inside `.env.example` and paste it inside a new file called `.env` in the root.

To start your app, run:
```sh
yarn dev
```

## AWS Simple Email Service
We have some scripts in `./scripts` responsible for managing our email templates in AWS. To run one of them, please consider running the following command:
```sh
node ./scripts/<name of the script>.js
```

## Generating migrations
To generate a database migration, run the following command:
```sh
npx sequelize-cli migration:generate --name <migration name here>
```
