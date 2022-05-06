# centauri
Our back-end service.

## Setup

First, start all the required databases with the following command:
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
