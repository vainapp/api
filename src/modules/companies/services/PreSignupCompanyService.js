import querystring from 'node:querystring'

import { ForbiddenError } from '../../../shared/errors'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import EmployeeRole from '../../../shared/infra/sequelize/models/EmployeeRole'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'
import { generateCheckoutSession } from '../../../shared/lib/Stripe'
import Company from '../infra/sequelize/models/Company'

class PreSignupCompanyService {
  async execute({ email, price_id }) {
    const existingEmployee = await Employee.findOne({
      where: { email },
      include: [
        {
          model: EmployeeRole,
          attributes: ['id', 'role'],
        },
      ],
    })

    if (!existingEmployee) {
      return {
        statusCode: 204,
      }
    }

    const isAdmin = existingEmployee.EmployeeRoles.some(
      (role) => role.role === 'ADMIN'
    )

    if (isAdmin === false) {
      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

    if (isAdmin === true && existingEmployee.verified === false) {
      const [existingLink, newLink] = await EmailVerificationLink.findOrCreate({
        where: {
          employee_id: existingEmployee.id,
          verified: false,
        },
      })

      const verificationEmailParams = await buildDirectEmailParams({
        toAddress: existingEmployee.email,
        template: 'COMPANY_VERIFY_EMAIL',
        templateData: {
          name: existingEmployee.name,
          link: `${process.env.API_URL}/companies/verify-email/${
            (existingLink || newLink).id
          }?${querystring.stringify({ price_id })}`,
        },
      })

      await Queue.add(SendEmailJob.key, verificationEmailParams)

      return {
        statusCode: 200,
        responseBody: {
          verified: false,
          checkout_url: null,
        },
      }
    }

    const company = await Company.findOne({
      where: { admin_id: existingEmployee.id },
    })

    if (
      isAdmin === true &&
      existingEmployee.verified === true &&
      company.has_active_subscription === false
    ) {
      const { url: checkout_url } = await generateCheckoutSession({
        price_id,
        company_id: company.id,
        customer_id: company.customer_id,
      })

      return {
        statusCode: 200,
        responseBody: {
          verified: true,
          checkout_url,
        },
      }
    }

    if (
      isAdmin === true &&
      existingEmployee.verified === true &&
      company.has_active_subscription === true
    ) {
      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

    return {
      statusCode: 204,
    }
  }
}

export default new PreSignupCompanyService()
