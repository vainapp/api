import { verify } from 'jsonwebtoken'
import { Op } from 'sequelize'

import authConfig from '../../../../../config/auth'
import ForbiddenError from '../../../../../shared/errors/Forbidden'
import UnauthorizedError from '../../../../../shared/errors/Unauthorized'
import Employee from '../../../../../shared/infra/sequelize/models/Employee'
import EmployeeRole from '../../../../../shared/infra/sequelize/models/EmployeeRole'

export default (ALLOWED_ROLES) => async (request, _, nextCallback) => {
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

    request.employee = { id: sub }
  } catch (error) {
    throw new ForbiddenError('Não autorizado')
  }

  /**
   * TODO
   * Create a method called `findByPkAndCacheIt` that will
   * check if the user is already in the cache, if it is,
   * return it, if it isn't, fetch it from the database,
   * save it in the cache and return it.
   */
  const employee = await Employee.findByPk(request.employee.id)

  if (!employee || !employee.verified) {
    throw new ForbiddenError('Não autorizado')
  }

  if (ALLOWED_ROLES == null || ALLOWED_ROLES.length === 0) {
    return nextCallback()
  }

  const employeeRoles = await EmployeeRole.findAll({
    where: {
      employee_id: request.employee.id,
      role: {
        [Op.in]: ALLOWED_ROLES,
      },
    },
  })

  if (employeeRoles.length === 0) {
    throw new ForbiddenError('Não autorizado')
  }

  return nextCallback()
}
