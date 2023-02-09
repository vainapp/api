import querystring from 'node:querystring'

import { BadRequestError, ForbiddenError } from '../../../shared/errors'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import EmployeeRole from '../../../shared/infra/sequelize/models/EmployeeRole'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'
import Company from '../infra/sequelize/models/Company'

class SignupCompanyService {
  async execute({
    email,
    password,
    password_confirmation,
    company_name,
    phone_number,
    name,
    price_id,
  }) {
    if (password !== password_confirmation) {
      throw new BadRequestError('As senhas precisam ser iguais')
    }

    const existingEmployee = await Employee.findOne({
      where: { email },
    })

    if (existingEmployee) {
      if (
        existingEmployee.verified === false &&
        existingEmployee.phone_number !== phone_number
      ) {
        existingEmployee.phone_number = phone_number
        await existingEmployee.save()
      }

      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

    const employee = await Employee.create({
      name,
      email,
      phone_number,
      password,
    })

    const company = await Company.create({
      name: company_name,
      admin_id: employee.id,
    })

    await EmployeeRole.create({
      employee_id: employee.id,
      role: 'ADMIN',
    })

    const [existingLink, newLink] = await EmailVerificationLink.findOrCreate({
      where: {
        employee_id: employee.id,
        verified: false,
      },
    })

    const verificationEmailParams = await buildDirectEmailParams({
      toAddress: email,
      template: 'COMPANY_VERIFY_EMAIL',
      templateData: {
        name,
        link: `${process.env.API_URL}/companies/verify-email/${
          (existingLink || newLink).id
        }?${querystring.stringify({ price_id })}`,
      },
    })

    await Queue.add(SendEmailJob.key, verificationEmailParams)

    return {
      company_id: company.id,
      employee_id: employee.id,
    }
  }
}

export default new SignupCompanyService()
