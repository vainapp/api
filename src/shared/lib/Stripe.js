import Stripe from 'stripe'

import Company from '../../modules/companies/infra/sequelize/models/Company'
import { TRIAL_DURATION } from '../constants/trial'
import NotFoundError from '../errors/NotFound'
import Employee from '../infra/sequelize/models/Employee'
import EmployeeRole from '../infra/sequelize/models/EmployeeRole'

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2022-08-01',
  appInfo: {
    name: 'back-end',
  },
})

export const findOrCreateCustomer = async (employee) => {
  const adminRole = await EmployeeRole.findOne({
    where: {
      employee_id: employee.id,
      role: 'ADMIN',
    },
    attributes: ['id', 'role'],
  })

  if (employee.verified === false) {
    throw new Error(
      'Cannot create a customer without a verified employee already registered in the database'
    )
  }

  if (!adminRole) {
    throw new Error('Cannot create a customer without an admin employee')
  }

  const company = await Company.findOne({
    where: {
      admin_id: employee.id,
    },
  })

  if (!company) {
    throw new Error('Cannot create a customer that is not admin of a company')
  }

  if (company.customer_id) {
    return {
      customer_id: company.customer_id,
    }
  }

  const customer = await stripe.customers.create({
    email: employee.email,
    phone: employee.phone_number,
    name: company.name,
  })

  await company.update({
    customer_id: customer.id,
  })

  return {
    customer_id: customer.id,
  }
}

export const generateCheckoutSession = async ({
  price_id,
  company_id,
  customer_id,
}) => {
  const company = await Company.findByPk(company_id)

  if (!customer_id) {
    const employee = await Employee.findByPk(company.admin_id)

    const { customer_id: new_customer_id } = await findOrCreateCustomer(
      employee
    )

    customer_id = new_customer_id
  }

  const checkoutSessionsToExpire = await stripe.checkout.sessions.list({
    customer: customer_id,
  })

  await Promise.all(
    checkoutSessionsToExpire.data.map(async (session) => {
      if (session.status === 'open') {
        await stripe.checkout.sessions.expire(session.id)
      }
    })
  )

  const { product } = await stripe.prices.retrieve(price_id, {
    expand: ['product'],
  })

  if (product.active === false) {
    throw new NotFoundError('Plano não encontrado')
  }

  const hasTrial =
    product.metadata.allow_free_trial === 'true' &&
    company.subscription_active_until === null

  const result = await stripe.checkout.sessions.create({
    success_url: `${process.env.APP_WEB_URL}/payment-succeeded`,
    cancel_url: `${process.env.APP_WEB_URL}/`,
    client_reference_id: company_id,
    customer: customer_id,
    ...(hasTrial
      ? {
          subscription_data: {
            trial_end: TRIAL_DURATION,
          },
        }
      : {}),
    mode: 'subscription',
    line_items: [
      {
        price: price_id,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
  })

  return result
}

export default stripe
