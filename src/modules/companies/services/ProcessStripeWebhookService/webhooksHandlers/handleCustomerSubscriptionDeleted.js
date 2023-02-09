import { NotFoundError } from '../../../../../shared/errors'
import buildDirectEmailParams from '../../../../../shared/helpers/buildDirectEmailParams'
import formatDate from '../../../../../shared/helpers/formatDate'
import Employee from '../../../../../shared/infra/sequelize/models/Employee'
import SendEmailJob from '../../../../../shared/jobs/SendEmail'
import Queue from '../../../../../shared/lib/Queue'
import Company from '../../../infra/sequelize/models/Company'

export const handleCustomerSubscriptionDeleted = async (payload) => {
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

  const admin = await Employee.findByPk(company.admin_id)

  const confirmationEmailParams = await buildDirectEmailParams({
    toAddress: admin.email,
    template: 'COMPANY_SUBSCRIPTION_DELETED',
    templateData: {
      name: admin.name,
      subscription_active_until: formatDate(
        company.subscription_active_until || Date.now()
      ),
    },
  })
  await Queue.add(SendEmailJob.key, confirmationEmailParams)
}
