import jwt from 'jsonwebtoken'

import User from '../infra/sequelize/models/User'
import ForbiddenError from '../../../shared/errors/Forbidden'
import authConfig from '../../../config/auth'
import CacheService from '../../../shared/services/CacheService'
import { LONG_TERM_DATA_DURATION } from '../../../config/redis'

class UpdateSessionService {
  async execute({ refresh_token }) {
    const userId = await CacheService.recover(`refresh-token:${refresh_token}`)

    if (!userId) {
      throw new ForbiddenError('Não autorizado')
    }

    const user = await User.findByPk(userId)

    const { id, name, email, phone_number } = user

    const accessToken = jwt.sign({}, authConfig.secret, {
      subject: id,
      expiresIn: authConfig.accessToken.expiresIn,
      audience: authConfig.accessToken.audience,
    })
    const newRefreshToken = jwt.sign({}, authConfig.secret, {
      subject: id,
      expiresIn: authConfig.refreshToken.expiresIn,
      audience: authConfig.refreshToken.audience,
    })

    await CacheService.invalidate(`refresh-token:${refresh_token}`)
    await CacheService.save(
      `refresh-token:${newRefreshToken}`,
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
      refresh_token: newRefreshToken,
    }
  }
}

export default new UpdateSessionService()
