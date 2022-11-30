import Joi from 'joi'

const sessionStoreSchema = Joi.object({
  refresh_token: Joi.string().required().label('Refresh token'),
})

export default sessionStoreSchema
