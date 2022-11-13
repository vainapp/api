import ForgotPasswordCode from '../infra/sequelize/models/ForgotPasswordCode'
import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'
import BadRequestError from '../../../shared/errors/BadRequest'
import TransactionService from '../../../shared/services/TransactionService'

class UpdateForgotPasswordService extends TransactionService {
  async execute({ forgotPasswordCodeId, password, passwordConfirmation }) {
    try {
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

      await forgotPasswordCode.update(
        { active: false },
        { transaction: this.transaction }
      )
      await user.update({ password }, { transaction: this.transaction })
    } catch (error) {
      await this.transaction.rollback()

      throw error
    }
  }
}

export default new UpdateForgotPasswordService()
