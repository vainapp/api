import ForgotPasswordCode from '../infra/sequelize/models/ForgotPasswordCode'
import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'

class ShowForgotPasswordService {
  async execute({ email, code }) {
    const user = await User.findOne({
      where: {
        email,
      },
    })

    if (!user || !user.verified) {
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
