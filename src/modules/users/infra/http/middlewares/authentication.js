import { verify } from 'jsonwebtoken'

import authConfig from '../../../../../config/auth'
import ForbiddenError from '../../../../../shared/errors/Forbidden'
import UnauthorizedError from '../../../../../shared/errors/Unauthorized'
import User from '../../sequelize/models/User'

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

  // TODO search for PK and check if it's verified using JS
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
