import Sequelize from 'sequelize'

import databaseConfig from '../../../config/database'
import User from '../../../modules/users/infra/sequelize/models/User'
import EmailVerificationLink from '../../../modules/users/infra/sequelize/models/EmailVerificationLink'
import ForgotPasswordCode from '../../../modules/users/infra/sequelize/models/ForgotPasswordCode'
import Address from '../../../modules/users/infra/sequelize/models/Address'
import PhoneNumberVerificationCode from '../../../modules/users/infra/sequelize/models/PhoneNumberVerificationCode'

const models = [
  User,
  EmailVerificationLink,
  ForgotPasswordCode,
  Address,
  PhoneNumberVerificationCode,
]

class Database {
  constructor() {
    this.initDatabase()
  }

  initDatabase() {
    this.connection = new Sequelize(databaseConfig)

    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      )
  }
}

export default new Database()
