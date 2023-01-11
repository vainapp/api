import { NotFoundError } from '../../../../../shared/errors'
import buildDirectEmailParams from '../../../../../shared/helpers/buildDirectEmailParams'
import SendEmailJob from '../../../../../shared/jobs/SendEmail'
import Queue from '../../../../../shared/lib/Queue'
import Company from '../../../infra/sequelize/models/Company'
import Employee from '../../../infra/sequelize/models/Employee'

export const handleCustomerSubscriptionTrialWillEnd = async (payload) => {
  const { object: subscription } = payload.data
  const { customer: customer_id, description } = subscription

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

  const subscriptionTrialWillEndParams = await buildDirectEmailParams({
    toAddress: admin.email,
    template: 'COMPANY_CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END',
    templateData: {
      name: admin.name,
      description,
    },
  })
  await Queue.add(SendEmailJob.key, subscriptionTrialWillEndParams)
}
