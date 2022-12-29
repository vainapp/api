// import { ForbiddenError } from '../../../shared/errors'
// import Company from '../infra/sequelize/models/Company'
// import Employee from '../infra/sequelize/models/Employee'
// import EmployeeRole from '../infra/sequelize/models/EmployeeRole'

class StoreCompanyService {
  async execute({
    name,
    company_name,
    email,
    password,
    password_confirmation,
    phone_number,
  }) {
    console.log({
      name,
      company_name,
      email,
      password,
      password_confirmation,
      phone_number,
    })
  }
}

export default new StoreCompanyService()
