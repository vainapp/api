import Joi from 'joi'

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().label('Senha atual'),
  newPassword: Joi.string().required().label('Nova senha'),
  newPasswordConfirmation: Joi.string()
    .required()
    .label('Confirmação da nova senha'),
})

export default updatePasswordSchema
