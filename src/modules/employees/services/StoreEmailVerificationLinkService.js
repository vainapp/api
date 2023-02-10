import { ForbiddenError } from '../../../shared/errors'
import NotFoundError from '../../../shared/errors/NotFound'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import generateRandomPassword from '../../../shared/helpers/generateRandomPassword'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'
import Company from '../../companies/infra/sequelize/models/Company'
import Franchise from '../../companies/infra/sequelize/models/Franchise'

class StoreEmailVerificationLinkService {
  async execute({ email }) {
    const employee = await Employee.findOne({
      where: { email },
    })

    if (!employee) {
      throw new NotFoundError('Endereço de e-mail não encontrado')
    }

    if (employee.email_verified) {
      throw new ForbiddenError('E-mail já verificado')
    }

    const emailVerificationLink = await EmailVerificationLink.findOne({
      where: { employee_id: employee.id, verified: false },
    })

    if (!emailVerificationLink) {
      throw new NotFoundError('Link de verificação de e-mail não encontrado')
    }

    const password = generateRandomPassword()

    await employee.update({
      password,
    })

    const franchise = await Franchise.findOne({
      where: {
        employee_id: employee.id,
      },
    })
    const company = await Company.findByPk(franchise.company_id)
    const admin = await Employee.findByPk(company.admin_id)

    const verificationEmailParams = await buildDirectEmailParams({
      toAddress: email,
      template: 'EMPLOYEE_VERIFY_EMAIL',
      templateData: {
        name: employee.name,
        email,
        password,
        invitee_sender_name: admin.name,
        invite_sender_organization_name: company.name,
        action_url: `${process.env.API_URL}/employees/verify-email/${emailVerificationLink.id}`,
        login_url: process.env.DASHBOARD_WEB_URL,
      },
    })

    await Queue.add(SendEmailJob.key, verificationEmailParams)
  }
}

export default new StoreEmailVerificationLinkService()
