import Sequelize from 'sequelize'

import databaseConfig from '../../../config/database'
import Address from '../../../modules/users/infra/sequelize/models/Address'
import EmailVerificationLink from '../../../modules/users/infra/sequelize/models/EmailVerificationLink'
import ForgotPasswordCode from '../../../modules/users/infra/sequelize/models/ForgotPasswordCode'
import PhoneNumberVerificationCode from '../../../modules/users/infra/sequelize/models/PhoneNumberVerificationCode'
import ProfilePhoto from '../../../modules/users/infra/sequelize/models/ProfilePhoto'
import User from '../../../modules/users/infra/sequelize/models/User'

const models = [
  User,
  EmailVerificationLink,
  ForgotPasswordCode,
  Address,
  PhoneNumberVerificationCode,
  ProfilePhoto,
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
