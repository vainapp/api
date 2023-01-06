import Joi from 'joi'

const resendEmailVerificationSchema = Joi.object({
  email: Joi.string().email().required().label('Endereço de e-mail'),
  price_id: Joi.string().required().label('ID do preço'),
})

export default resendEmailVerificationSchema
