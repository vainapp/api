import jwt from 'jsonwebtoken'

import User from '../models/User'
import ForbiddenError from '../errors/Forbidden'
import authConfig from '../../config/auth'

class StoreSessionService {
  async execute({ email, password }) {
    const user = await User.findOne({
      where: { email, verified: true }
    })

    if (!user) {
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
      token: jwt.sign({ sub: id }, authConfig.secret)
    }
  }
}

export default new StoreSessionService()
