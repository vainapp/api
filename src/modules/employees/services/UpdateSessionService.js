import jwt from 'jsonwebtoken'

import authConfig from '../../../config/auth'
import { LONG_TERM_DATA_DURATION } from '../../../config/redis'
import ForbiddenError from '../../../shared/errors/Forbidden'
import Employee from '../../../shared/infra/sequelize/models/Employee'
import EmployeeRole from '../../../shared/infra/sequelize/models/EmployeeRole'
import CacheService from '../../../shared/services/CacheService'

class UpdateSessionService {
  async execute({ refresh_token }) {
    try {
      const { aud } = jwt.verify(refresh_token, authConfig.secret)

      if (aud !== authConfig.refreshToken.audience) {
        throw new ForbiddenError('Não autorizado')
      }
    } catch (error) {
      throw new ForbiddenError('Não autorizado')
    }

    const employeeId = await CacheService.recover(
      `refresh-token:${refresh_token}`
    )

    if (!employeeId) {
      throw new ForbiddenError('Não autorizado')
    }

    const employeeRoles = await EmployeeRole.findAll({
      where: {
        employee_id: employeeId,
      },
    })

    const roles = employeeRoles.map((role) => role.role)

    const employee = await Employee.findByPk(employeeId)

    const { id, name, email, phone_number } = employee

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
        roles,
      },
      access_token: accessToken,
      refresh_token: newRefreshToken,
    }
  }
}

export default new UpdateSessionService()
