import Joi from 'joi'

const userStoreSchema = Joi.object({
  name: Joi.string().required().label('Nome'),
  email: Joi.string().email().required().label('E-mail'),
  password: Joi.string().required().label('Senha'),
  passwordConfirmation: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .label('Confirmação de senha'),
})

export default userStoreSchema
