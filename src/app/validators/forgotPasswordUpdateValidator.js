import Joi from 'joi'

const forgotPasswordUpdateSchema = Joi.object({
  token: Joi.string().required().label('Token'),
  password: Joi.string().required().label('Senha'),
  passwordConfirmation: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .label('Confirmação de senha'),
})

export default forgotPasswordUpdateSchema
