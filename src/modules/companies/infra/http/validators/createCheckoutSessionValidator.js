import Joi from 'joi'

const createCheckoutSessionSchema = Joi.object({
  price_id: Joi.string().required().label('ID do plano'),
  company_id: Joi.string().required().label('ID da empresa'),
  employee_email: Joi.string().email().required().label('E-mail pessoal'),
})

export default createCheckoutSessionSchema
