import validationMessages from '../../../constants/validationMessages'
import { BadRequestError } from '../../../errors'

export default (validator) => async (request, _, nextCallback) => {
  try {
    const validated = await validator.validateAsync(request.body, {
      messages: validationMessages,
    })
    request.body = validated

    nextCallback()
  } catch (error) {
    if (error.isJoi) {
      throw new BadRequestError(error.details[0].message)
    }

    throw error
  }
}
