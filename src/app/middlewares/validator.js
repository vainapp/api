import * as validators from '../validators'
import { BadRequestError } from '../errors'
import validationMessages from '../../constants/validationMessages'

export default (validator) => {
  if (!validators[validator]) {
    throw new Error(`Validator ${validator} not found`)
  }

  return async (request, _, nextCallback) => {
    try {
      const validated = await validators[validator].validateAsync(
        request.body,
        {
          messages: validationMessages,
        }
      )
      request.body = validated

      nextCallback()
    } catch (error) {
      if (error.isJoi) {
        throw new BadRequestError(error.details[0].message)
      }

      throw error
    }
  }
}
