import Joi from 'joi'

const sessionStoreSchema = Joi.object({
  email: Joi.string().email().required().label('E-mail'),
  password: Joi.string().required('Senha'),
})

export default sessionStoreSchema
