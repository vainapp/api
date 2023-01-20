# back-end
Our back-end service.

## Setup

If this is the very first time you're running this app, consider running all the migrations in your local database with:
```sh
yarn sequelize-cli db:migrate --url postgresql://postgres:postgres@localhost:5432/grupoc
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
