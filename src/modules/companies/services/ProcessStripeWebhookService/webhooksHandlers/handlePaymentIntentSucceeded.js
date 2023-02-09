import { NotFoundError } from '../../../../../shared/errors'
import buildDirectEmailParams from '../../../../../shared/helpers/buildDirectEmailParams'
import Employee from '../../../../../shared/infra/sequelize/models/Employee'
import SendEmailJob from '../../../../../shared/jobs/SendEmail'
import Queue from '../../../../../shared/lib/Queue'
import stripe from '../../../../../shared/lib/Stripe'
import Company from '../../../infra/sequelize/models/Company'

export const handlePaymentIntentSucceeded = async (payload) => {
  const { object: payment_intent } = payload.data
  const { customer: customer_id, charges } = payment_intent

  const company = await Company.findOne({
    where: {
      customer_id,
    },
  })

  if (!company) {
    throw new NotFoundError(`Company with customer_id ${customer_id} not found`)
  }

  const admin = await Employee.findOne({
    where: {
      id: company.admin_id,
    },
  })

  const { invoice } = await stripe.charges.retrieve(charges.data[0].id, {
    expand: ['invoice.subscription'],
  })

  const { price } = invoice.subscription.items.data[0]
  const { period, description } = invoice.lines.data[0]

  await company.update({
    price_id: price.id,
    product_id: price.product,
    subscription_active_until: new Date(period.end * 1000),
  })

  const confirmationEmailParams = await buildDirectEmailParams({
    toAddress: admin.email,
    template: 'COMPANY_PAYMENT_INTENT_SUCCEEDED',
    templateData: {
      name: admin.name,
      description,
      payment_intent_id: payment_intent.id,
    },
  })
  await Queue.add(SendEmailJob.key, confirmationEmailParams)
}
