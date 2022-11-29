const dotenv = require('dotenv')

const envs = {
  test: '.test.env',
  development: '.development.env',
  staging: '.staging.env',
  production: '.production.env',
}

dotenv.config({
  path: envs[process.env.NODE_ENV || 'development'],
})
