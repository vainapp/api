import jwt from 'jsonwebtoken'

import authConfig from '../../../config/auth'
import { LONG_TERM_DATA_DURATION } from '../../../config/redis'
import ForbiddenError from '../../../shared/errors/Forbidden'
import CacheService from '../../../shared/services/CacheService'
import User from '../infra/sequelize/models/User'

class StoreSessionService {
  async execute({ email, password }) {
    const user = await User.findOne({
      where: { email },
    })

    if (!user || !user.verified) {
      throw new ForbiddenError('Dados de acesso inválidos')
    }

    const passwordMatch = await user.checkPassword(password)
    if (!passwordMatch) {
      throw new ForbiddenError('Dados de acesso inválidos')
    }

    const { id, name, phone_number } = user

    const accessToken = jwt.sign({}, authConfig.secret, {
      subject: id,
      expiresIn: authConfig.accessToken.expiresIn,
      audience: authConfig.accessToken.audience,
    })
    const refreshToken = jwt.sign({}, authConfig.secret, {
      subject: id,
      expiresIn: authConfig.refreshToken.expiresIn,
      audience: authConfig.refreshToken.audience,
    })

    await CacheService.save(
      `refresh-token:${refreshToken}`,
      id,
      LONG_TERM_DATA_DURATION
    )

    return {
      user: {
        id,
        name,
        email,
        phone_number,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }
}

export default new StoreSessionService()
