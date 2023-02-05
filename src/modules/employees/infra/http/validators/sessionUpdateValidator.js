import Joi from 'joi'

const sessionUpdateSchema = Joi.object({
  refresh_token: Joi.string().required().label('Refresh token'),
})

export default sessionUpdateSchema
