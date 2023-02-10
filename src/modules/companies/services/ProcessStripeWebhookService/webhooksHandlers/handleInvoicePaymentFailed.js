import { NotFoundError } from '../../../../../shared/errors'
import buildDirectEmailParams from '../../../../../shared/helpers/buildDirectEmailParams'
import Employee from '../../../../../shared/infra/sequelize/models/Employee'
import SendEmailJob from '../../../../../shared/jobs/SendEmail'
import Queue from '../../../../../shared/lib/Queue'
import { generateCheckoutSession } from '../../../../../shared/lib/Stripe'
import Company from '../../../infra/sequelize/models/Company'

export const handleInvoicePaymentFailed = async (payload) => {
  const { object: invoice } = payload.data
  const { customer: customer_id } = invoice

  const company = await Company.findOne({
    where: {
      customer_id,
    },
  })

  if (!company) {
    throw new NotFoundError(`Company with customer_id ${customer_id} not found`)
  }

  if (company.subscription_active_until === null) {
    return
  }

  const admin = await Employee.findOne({
    where: {
      id: company.admin_id,
    },
  })

  const { price } = invoice.subscription.items.data[0]
  const { description } = invoice.lines.data[0]

  const { url: checkout_url } = await generateCheckoutSession({
    company_id: company.id,
    customer_id: company.customer_id,
    price_id: price.id,
  })

  const paymentFailureParams = await buildDirectEmailParams({
    toAddress: admin.email,
    template: 'COMPANY_INVOICE_PAYMENT_FAILED',
    templateData: {
      name: admin.name,
      description,
      action_url: checkout_url,
    },
  })
  await Queue.add(SendEmailJob.key, paymentFailureParams)
}
