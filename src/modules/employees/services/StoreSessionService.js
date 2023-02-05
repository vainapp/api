import jwt from 'jsonwebtoken'

import authConfig from '../../../config/auth'
import { LONG_TERM_DATA_DURATION } from '../../../config/redis'
import ForbiddenError from '../../../shared/errors/Forbidden'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import CacheService from '../../../shared/services/CacheService'

class StoreSessionService {
  async execute({ email, password }) {
    const employee = await Employee.findOne({
      where: { email },
    })

    if (!employee || !employee.verified) {
      throw new ForbiddenError('Dados de acesso inválidos')
    }

    const passwordMatch = await employee.checkPassword(password)
    if (!passwordMatch) {
      throw new ForbiddenError('Dados de acesso inválidos')
    }

    const { id, name, phone_number } = employee

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
      employee: {
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
