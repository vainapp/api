import Sequelize from 'sequelize'

import databaseConfig from '../../../config/database'
import Company from '../../../modules/companies/infra/sequelize/models/Company'
import Employee from '../../../modules/companies/infra/sequelize/models/Employee'
import EmployeeRole from '../../../modules/companies/infra/sequelize/models/EmployeeRole'
import Franchise from '../../../modules/companies/infra/sequelize/models/Franchise'
import FranchiseEmployee from '../../../modules/companies/infra/sequelize/models/FranchiseEmployee'
import Address from '../../../modules/users/infra/sequelize/models/Address'
import ForgotPasswordCode from '../../../modules/users/infra/sequelize/models/ForgotPasswordCode'
import PhoneNumberVerificationCode from '../../../modules/users/infra/sequelize/models/PhoneNumberVerificationCode'
import ProfilePhoto from '../../../modules/users/infra/sequelize/models/ProfilePhoto'
import User from '../../../modules/users/infra/sequelize/models/User'

import EmailVerificationLink from './models/EmailVerificationLink'

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
