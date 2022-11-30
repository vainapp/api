import ForgotPasswordCode from '../infra/sequelize/models/ForgotPasswordCode'
import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'
import BadRequestError from '../../../shared/errors/BadRequest'

class UpdateForgotPasswordService {
  async execute({ forgot_password_code_id, password, password_confirmation }) {
    const forgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        id: forgot_password_code_id,
        active: true,
      },
    })

    if (!forgotPasswordCode) {
      throw new NotFoundError('Código de recuperação de senha inválido')
    }

    if (password !== password_confirmation) {
      throw new BadRequestError('As senhas precisam ser iguais')
    }

    const { user_id } = forgotPasswordCode

    const user = await User.findOne({
      where: {
        id: user_id,
      },
    })

    if (!user || !user.verified) {
      throw new NotFoundError('Conta não encontrada')
    }

    await forgotPasswordCode.update({ active: false })
    await user.update({ password })
  }
}

export default new UpdateForgotPasswordService()
