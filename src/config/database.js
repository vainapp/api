require('../shared/infra/http/bootstrap')

module.exports = {
  dialect: 'postgres',
  database: process.env.POSTGRES_DATABASE,
  replication: {
    read: [
      {
        host: process.env.POSTGRES_READ_1_HOST,
        port: process.env.POSTGRES_READ_1_PORT,
        username: process.env.POSTGRES_READ_1_USERNAME,
        password: process.env.POSTGRES_READ_1_PASSWORD,
      },
    ],
    write: {
      host: process.env.POSTGRES_WRITE_HOST,
      port: process.env.POSTGRES_WRITE_PORT,
      username: process.env.POSTGRES_WRITE_USERNAME,
      password: process.env.POSTGRES_WRITE_PASSWORD,
    },
  },
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
  logging: false,
  ...(!['test', 'development'].includes(process.env.NODE_ENV)
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {}),
}
