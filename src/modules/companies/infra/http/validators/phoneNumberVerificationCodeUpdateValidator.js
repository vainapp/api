import Joi from 'joi'

const phoneNumberVerificationCodeUpdateSchema = Joi.object({
  employee_id: Joi.string().required().label('ID da conta'),
  code: Joi.string().required().label('Código de verificação'),
})

export default phoneNumberVerificationCodeUpdateSchema
