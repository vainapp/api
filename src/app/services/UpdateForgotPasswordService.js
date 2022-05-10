import ForgotPasswordCode from '../models/ForgotPasswordCode'
import User from '../models/User'
import NotFoundError from '../errors/NotFound'
import BadRequestError from '../errors/BadRequest'

class UpdateForgotPasswordService {
  async execute({ forgotPasswordCodeId, password, passwordConfirmation }) {
    const forgotPasswordCode = await ForgotPasswordCode.findOne({
      where: {
        id: forgotPasswordCodeId,
        active: true,
      },
    })

    if (!forgotPasswordCode) {
      throw new NotFoundError('Código de recuperação de senha inválido')
    }

    if (password !== passwordConfirmation) {
      throw new BadRequestError('As senhas precisam ser iguais')
    }

    const { user_id } = forgotPasswordCode

    const user = await User.findOne({
      where: {
        id: user_id,
        verified: true,
      },
    })

    if (!user) {
      throw new NotFoundError('Conta não encontrada')
    }

    await forgotPasswordCode.update({ active: false })
    await user.update({ password })
  }
}

export default new UpdateForgotPasswordService()
