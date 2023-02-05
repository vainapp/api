import { NotFoundError } from '../../../shared/errors'
import BadRequestError from '../../../shared/errors/BadRequest'
import ForbiddenError from '../../../shared/errors/Forbidden'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import EmployeeRole from '../../../shared/infra/sequelize/models/EmployeeRole'
import Franchise from '../../../shared/infra/sequelize/models/Franchise'
import FranchiseEmployee from '../../../shared/infra/sequelize/models/FranchiseEmployee'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'
import Company from '../../companies/infra/sequelize/models/Company'

class StoreEmployeeService {
  async execute({
    name,
    email,
    phone_number,
    password,
    password_confirmation,
    roles,
    franchises_ids,
    admin_employee_id,
  }) {
    if (password !== password_confirmation) {
      throw new BadRequestError('As senhas precisam ser iguais')
    }

    const existingEmployee = await Employee.findOne({
      where: { email },
    })

    if (existingEmployee) {
      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

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

    await Promise.all(
      franchises_ids.map(async (franchise_id) => {
        const exists = await Franchise.findOne({
          where: {
            id: franchise_id,
            company_id: admin_employee_id,
          },
        })

        if (!exists) {
          throw new BadRequestError('Uma ou mais franquias não são válidas')
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

    const emailParams = buildDirectEmailParams({
      toAddress: employee.email,
      template: 'EMPLOYEE_VERIFY_EMAIL',
      templateData: {
        name: employee.name,
        link: `${process.env.APP_WEB_URL}/verify-email/${link.id}`,
      },
    })

    await Queue.add(SendEmailJob.key, emailParams)

    return {
      employee_id: employee.id,
    }
  }
}

export default new StoreEmployeeService()
