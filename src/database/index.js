import Sequelize from 'sequelize'

import databaseConfig from '../config/database'
import User from '../app/models/User'
import AccountVerificationLink from '../app/models/AccountVerificationLink'
import ForgotPasswordCode from '../app/models/ForgotPasswordCode'

const models = [User, AccountVerificationLink, ForgotPasswordCode]

class Database {
  constructor() {
    this.initRelationalDatabase()
  }

  initRelationalDatabase() {
    this.relationalConnection = new Sequelize(databaseConfig)

    models
      .map((model) => model.init(this.relationalConnection))
      .map(
        (model) =>
          model.associate && model.associate(this.relationalConnection.models)
      )
  }
}

export default new Database()
