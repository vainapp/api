import ForgotPasswordCode from '../infra/sequelize/models/ForgotPasswordCode'
import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'
import BadRequestError from '../../../shared/errors/BadRequest'
import TransactionService from '../../../shared/services/TransactionService'

class UpdateForgotPasswordService extends TransactionService {
  async execute({ forgotPasswordCodeId, password, passwordConfirmation }) {
    const transaction = await this.createTransaction()

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
        },
      })

      if (!user || !user.verified) {
        throw new NotFoundError('Conta não encontrada')
      }

      await forgotPasswordCode.update({ active: false }, { transaction })
      await user.update({ password }, { transaction })

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()

      throw error
    }
  }
}

export default new UpdateForgotPasswordService()
