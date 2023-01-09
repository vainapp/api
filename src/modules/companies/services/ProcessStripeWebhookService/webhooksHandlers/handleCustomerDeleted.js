import { NotFoundError } from '../../../../../shared/errors'
import Company from '../../../infra/sequelize/models/Company'

export const handleCustomerDeleted = async (payload) => {
  const { object: customer } = payload.data
  const { id: customer_id } = customer

  const company = await Company.findOne({
    where: {
      customer_id,
    },
  })

  if (!company) {
    throw new NotFoundError(`Company with customer_id ${customer_id} not found`)
  }

  await company.update({
    customer_id: null,
    subscription_active_until: null,
    product_id: null,
    price_id: null,
  })
}
