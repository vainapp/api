import querystring from 'node:querystring'

import { ForbiddenError } from '../../../shared/errors'
import NotFoundError from '../../../shared/errors/NotFound'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'

class StoreEmailVerificationLinkService {
  async execute({ email, price_id }) {
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

    const verificationEmailParams = await buildDirectEmailParams({
      toAddress: email,
      template: 'COMPANY_VERIFY_EMAIL',
      templateData: {
        name: employee.name,
        link: `${process.env.API_URL}/companies/verify-email/${
          emailVerificationLink.id
        }?${querystring.stringify({ price_id })}`,
      },
    })

    await Queue.add(SendEmailJob.key, verificationEmailParams)
  }
}

export default new StoreEmailVerificationLinkService()
