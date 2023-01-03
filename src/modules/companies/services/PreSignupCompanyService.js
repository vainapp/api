import querystring from 'node:querystring'

import { ForbiddenError } from '../../../shared/errors'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'
import stripe from '../../../shared/lib/Stripe'
import Company from '../infra/sequelize/models/Company'
import Employee from '../infra/sequelize/models/Employee'
import EmployeeRole from '../infra/sequelize/models/EmployeeRole'

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
    const hasActiveSubscription = !!company.product_id && !!company.price_id

    if (
      isAdmin === true &&
      existingEmployee.verified === true &&
      hasActiveSubscription === false
    ) {
      const sessions = await stripe.checkout.sessions.list({
        customer_details: {
          email: existingEmployee.email,
        },
      })

      await Promise.all(
        sessions.data.map(async (session) => {
          if (session.status === 'open') {
            await stripe.checkout.sessions.expire(session.id)
          }
        })
      )

      const checkoutSession = await stripe.checkout.sessions.create({
        success_url: `${process.env.APP_WEB_URL}/checkout/success`,
        cancel_url: `${process.env.APP_WEB_URL}/checkout/cancel`,
        client_reference_id: company.id,
        customer_email: existingEmployee.email,
        mode: 'subscription',
        line_items: [
          {
            price: price_id,
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
      })

      return {
        statusCode: 200,
        responseBody: {
          verified: true,
          checkout_url: checkoutSession.url,
        },
      }
    }

    if (
      isAdmin === true &&
      existingEmployee.verified === true &&
      hasActiveSubscription
    ) {
      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

    return {
      statusCode: 204,
    }
  }
}

export default new PreSignupCompanyService()
