import { verify } from 'jsonwebtoken'

import authConfig from '../../../../../config/auth'
import ForbiddenError from '../../../../../shared/errors/Forbidden'
import UnauthorizedError from '../../../../../shared/errors/Unauthorized'
import User from '../../sequelize/models/User'

export default async (request, _, nextCallback) => {
  const { authorization: authHeader } = request.headers

  if (!authHeader) {
    throw new UnauthorizedError('Não autorizado')
  }

  const [, token] = authHeader.split(' ')

  try {
    const { sub, aud } = verify(token, authConfig.secret)

    if (aud !== authConfig.accessToken.audience) {
      throw new ForbiddenError('Não autorizado')
    }

    request.user = { id: sub }
  } catch (error) {
    throw new ForbiddenError('Não autorizado')
  }

  const user = await User.findByPk(request.user.id)

  if (!user || !user.verified) {
    throw new ForbiddenError('Não autorizado')
  }

  return nextCallback()
}
