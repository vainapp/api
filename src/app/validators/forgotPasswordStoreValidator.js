import Joi from 'joi'

const forgotPasswordStoreSchema = Joi.object({
  email: Joi.string().email().required().label('E-mail'),
})

export default forgotPasswordStoreSchema
