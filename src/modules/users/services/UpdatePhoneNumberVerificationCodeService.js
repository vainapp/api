import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'
import PhoneNumberVerificationCode from '../infra/sequelize/models/PhoneNumberVerificationCode'
import TransactionService from '../../../shared/services/TransactionService'

class UpdatePhoneNumberVerificationCodeService extends TransactionService {
  async execute({ userId, code }) {
    const transaction = await this.createTransaction()

    try {
      const user = await User.findByPk(userId)

      if (!user) {
        throw new NotFoundError('Código de verificação inválido')
      }

      const existingCode = await PhoneNumberVerificationCode.findOne({
        where: {
          user_id: userId,
          code,
        },
      })

      if (!existingCode) {
        throw new NotFoundError('Código de verificação inválido')
      }

      if (existingCode.verified) {
        return
      }

      await existingCode.update(
        {
          verified: true,
        },
        { transaction }
      )

      await user.update({ phone_number_verified: true }, { transaction })

      await transaction.commit()
    } catch (error) {
      await this.transaction.rollback()

      throw error
    }
  }
}

export default new UpdatePhoneNumberVerificationCodeService()
