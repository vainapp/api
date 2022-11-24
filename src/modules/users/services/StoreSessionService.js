import jwt from 'jsonwebtoken'

import User from '../infra/sequelize/models/User'
import ForbiddenError from '../../../shared/errors/Forbidden'
import authConfig from '../../../config/auth'

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

    const { id, name } = user

    return {
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ sub: id }, authConfig.secret),
    }
  }
}

export default new StoreSessionService()
