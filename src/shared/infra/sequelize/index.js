import Sequelize from 'sequelize'

import databaseConfig from '../../../config/database'
import User from '../../../modules/users/infra/sequelize/models/User'
import EmailVerificationLink from '../../../modules/users/infra/sequelize/models/EmailVerificationLink'
import ForgotPasswordCode from '../../../modules/users/infra/sequelize/models/ForgotPasswordCode'
import Address from '../../../modules/users/infra/sequelize/models/Address'

const models = [User, EmailVerificationLink, ForgotPasswordCode, Address]

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
