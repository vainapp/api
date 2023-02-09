import { help } from '../../../../../shared/constants/emails'
import { NotFoundError } from '../../../../../shared/errors'
import buildDirectEmailParams from '../../../../../shared/helpers/buildDirectEmailParams'
import Employee from '../../../../../shared/infra/sequelize/models/Employee'
import SendEmailJob from '../../../../../shared/jobs/SendEmail'
import Queue from '../../../../../shared/lib/Queue'
import Company from '../../../infra/sequelize/models/Company'

export const handleCustomerSubscriptionTrialWillEnd = async (payload) => {
  const { object: subscription } = payload.data
  const { customer: customer_id } = subscription

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
      action_url: process.env.DASHBOARD_WEB_URL,
      close_account_url: `mailto:${help}?subject=Encerrar conta da Vain`,
      feedback_url: `mailto:${help}?subject=Feedback da Vain`,
    },
  })
  await Queue.add(SendEmailJob.key, subscriptionTrialWillEndParams)
}
