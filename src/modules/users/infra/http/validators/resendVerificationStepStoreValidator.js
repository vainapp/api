import Joi from 'joi'

const resendVerificationStepStoreSchema = Joi.object({
  email: Joi.string().email().required().label('Endereço de e-mail'),
})

export default resendVerificationStepStoreSchema
