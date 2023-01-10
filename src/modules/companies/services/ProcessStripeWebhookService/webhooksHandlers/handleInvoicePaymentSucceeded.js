import { NotFoundError } from '../../../../../shared/errors'
import buildDirectEmailParams from '../../../../../shared/helpers/buildDirectEmailParams'
import SendEmailJob from '../../../../../shared/jobs/SendEmail'
import Queue from '../../../../../shared/lib/Queue'
import Company from '../../../infra/sequelize/models/Company'
import Employee from '../../../infra/sequelize/models/Employee'

export const handleInvoicePaymentSucceeded = async (payload) => {
  const { object: invoice } = payload.data
  const { customer: customer_id } = invoice

  /**
   * We just want to execute this handler if it's free trial (price 0)
   */
  if (invoice.total > 0) {
    return
  }

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

  const { price, period, description } = invoice.lines.data[0]

  await company.update({
    price_id: price.id,
    product_id: price.product,
    subscription_active_until: new Date(period.end * 1000),
  })

  // TOOD create another email template for free trials
  const confirmationEmailParams = await buildDirectEmailParams({
    toAddress: admin.email,
    template: 'COMPANY_PAYMENT_INTENT_SUCCEEDED',
    templateData: {
      name: admin.name,
      description,
      payment_intent_id: invoice.id,
    },
  })
  await Queue.add(SendEmailJob.key, confirmationEmailParams)
}
