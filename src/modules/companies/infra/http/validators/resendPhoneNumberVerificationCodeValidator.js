import Joi from 'joi'

const resendPhoneNumberVerificationCodeSchema = Joi.object({
  email: Joi.string().email().required().label('Endereço de e-mail'),
})

export default resendPhoneNumberVerificationCodeSchema
