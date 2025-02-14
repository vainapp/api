import { NotFoundError } from '../../../shared/errors'
import ForbiddenError from '../../../shared/errors/Forbidden'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import generateRandomPassword from '../../../shared/helpers/generateRandomPassword'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import EmployeeRole from '../../../shared/infra/sequelize/models/EmployeeRole'
import FranchiseEmployee from '../../../shared/infra/sequelize/models/FranchiseEmployee'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'
import Company from '../../companies/infra/sequelize/models/Company'
import Franchise from '../../companies/infra/sequelize/models/Franchise'

class StoreEmployeeService {
  async execute({
    name,
    email,
    phone_number,
    roles,
    franchises_ids,
    admin_employee_id,
  }) {
    const existingEmployee = await Employee.findOne({
      where: { email },
    })

    if (existingEmployee) {
      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

    /**
     * TODO: how to handle this?
     * now, we can only allow companies' creators to create employees. We'd like
     * to allow all admins (employees with role 'admin') to create employees.
     */
    const company = await Company.findOne({
      where: {
        admin_id: admin_employee_id,
      },
    })

    if (!company) {
      throw new NotFoundError('Empresa não encontrada')
    }

    if (!company.has_active_subscription) {
      throw new ForbiddenError('Empresa não possui assinatura ativa')
    }

    const password = generateRandomPassword()

    const employee = await Employee.create({
      name,
      email,
      phone_number,
      password,
    })

    await Promise.all(
      roles.map((role) =>
        EmployeeRole.create({
          employee_id: employee.id,
          role,
        })
      )
    )

    await Promise.all(
      franchises_ids.map(async (franchise_id) => {
        const exists = await Franchise.findOne({
          where: {
            id: franchise_id,
            company_id: company.id,
          },
        })

        if (!exists) {
          throw new NotFoundError('Uma ou mais franquias não são válidas')
        }
      })
    )

    await Promise.all(
      franchises_ids.map((franchise_id) =>
        FranchiseEmployee.create({
          employee_id: employee.id,
          franchise_id,
        })
      )
    )

    const link = await EmailVerificationLink.create({
      employee_id: employee.id,
    })

    const admin = await Employee.findByPk(admin_employee_id)

    const emailParams = await buildDirectEmailParams({
      toAddress: email,
      template: 'EMPLOYEE_VERIFY_EMAIL',
      templateData: {
        name,
        email,
        password,
        invitee_sender_name: admin.name,
        invite_sender_organization_name: company.name,
        action_url: `${process.env.API_URL}/employees/verify-email/${link.id}`,
        login_url: process.env.DASHBOARD_WEB_URL,
      },
    })

    await Queue.add(SendEmailJob.key, emailParams)

    return {
      employee_id: employee.id,
    }
  }
}

export default new StoreEmployeeService()
