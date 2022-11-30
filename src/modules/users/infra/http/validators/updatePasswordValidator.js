import Joi from 'joi'

const updatePasswordSchema = Joi.object({
  current_password: Joi.string().required().label('Senha atual'),
  new_password: Joi.string().required().label('Nova senha'),
  new_password_confirmation: Joi.string()
    .required()
    .label('Confirmação da nova senha'),
})

export default updatePasswordSchema
