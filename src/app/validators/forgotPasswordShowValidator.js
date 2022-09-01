import Joi from 'joi'

const forgotPasswordShowSchema = Joi.object({
  email: Joi.string().email().required().label('E-mail'),
  code: Joi.string().required().label('Código'),
})

export default forgotPasswordShowSchema
