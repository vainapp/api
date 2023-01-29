import Sequelize from 'sequelize'

import databaseConfig from '../../../config/database'
import Company from '../../../modules/companies/infra/sequelize/models/Company'
import Franchise from '../../../modules/companies/infra/sequelize/models/Franchise'
import Address from '../../../modules/users/infra/sequelize/models/Address'
import ForgotPasswordCode from '../../../modules/users/infra/sequelize/models/ForgotPasswordCode'
import ProfilePhoto from '../../../modules/users/infra/sequelize/models/ProfilePhoto'
import User from '../../../modules/users/infra/sequelize/models/User'

import EmailVerificationLink from './models/EmailVerificationLink'
import Employee from './models/Employee'
import EmployeeRole from './models/EmployeeRole'
import FranchiseEmployee from './models/FranchiseEmployee'
import PhoneNumberVerificationCode from './models/PhoneNumberVerificationCode'

const models = [
  User,
  EmailVerificationLink,
  ForgotPasswordCode,
  Address,
  PhoneNumberVerificationCode,
  ProfilePhoto,
  Employee,
  Company,
  EmployeeRole,
  Franchise,
  FranchiseEmployee,
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
