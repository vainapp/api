import Joi from 'joi'

const resendPhoneNumberVerificationCodeSchema = Joi.object({
  employee_id: Joi.string().required().label('ID da conta'),
})

export default resendPhoneNumberVerificationCodeSchema
