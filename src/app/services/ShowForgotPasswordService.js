import ForgotPasswordCode from '../models/ForgotPasswordCode'
import User from '../models/User'
import NotFoundError from '../errors/NotFound'

class ShowForgotPasswordService {
  async execute({ email, code }) {
    const user = await User.findOne({
      where: {
        email,
        verified: true,
      },
    })

    if (!user) {
      throw new NotFoundError('Código de recuperação de senha inválido')
    }

    const forgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        user_id: user.id,
        code,
        active: true,
      },
    })

    if (!forgotPasswordCode) {
      throw new NotFoundError('Código de recuperação de senha inválido')
    }

    return {
      token: forgotPasswordCode.id,
    }
  }
}

export default new ShowForgotPasswordService()
