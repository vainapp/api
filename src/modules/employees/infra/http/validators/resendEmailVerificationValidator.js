import Joi from 'joi'

const resendEmailVerificationSchema = Joi.object({
  email: Joi.string().email().required().label('Endereço de e-mail'),
})

export default resendEmailVerificationSchema
