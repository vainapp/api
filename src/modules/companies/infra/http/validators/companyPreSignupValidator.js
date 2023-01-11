import Joi from 'joi'

const companyPreSignupSchema = Joi.object({
  email: Joi.string().email().required().label('E-mail pessoal'),
  price_id: Joi.string().required().label('ID do plano'),
})

export default companyPreSignupSchema
