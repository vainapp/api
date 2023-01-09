import Joi from 'joi'

const createCheckoutSessionSchema = Joi.object({
  price_id: Joi.string().required().label('ID do plano'),
  employee_id: Joi.string().required().label('ID da conta'),
})

export default createCheckoutSessionSchema
