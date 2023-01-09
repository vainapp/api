import { NotFoundError } from '../../../../../shared/errors'
import stripe from '../../../../../shared/lib/Stripe'
import Company from '../../../infra/sequelize/models/Company'
import Employee from '../../../infra/sequelize/models/Employee'

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

  if (!admin) {
    throw new NotFoundError(`Admin with id ${company.admin_id} not found`)
  }

  const charge = await stripe.charges.retrieve(charges.data[0].id, {
    expand: ['invoice.subscription'],
  })
  const { price } = charge.invoice.subscription.items.data[0]

  await company.update({
    price_id: price.id,
    product_id: price.product,
  })

  console.log({ email: admin.email }) // TODO send a confirmation email to admin
}
