import { verify } from 'jsonwebtoken'

import authConfig from '../../config/auth'
import ForbiddenError from '../errors/Forbidden'
import UnauthorizedError from '../errors/Unauthorized'
import User from '../models/User'

export default async (request, response, nextCallback) => {
  const { authorization: authHeader } = request.headers

  if (!authHeader) {
    throw new UnauthorizedError('Não autorizado')
  }

  const [, token] = authHeader.split(' ')

  try {
    const { sub } = verify(token, authConfig.secret)

    request.user = { id: sub }
  } catch (error) {
    throw new ForbiddenError('Não autorizado')
  }

  const user = await User.findOne({
    where: {
      id: request.user.id,
      verified: true,
    },
  })

  if (!user) {
    throw new ForbiddenError('Você precisa verificar seu e-mail para continuar')
  }

  return nextCallback()
}
