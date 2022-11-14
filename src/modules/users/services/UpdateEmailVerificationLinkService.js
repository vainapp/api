import EmailVerificationLink from '../infra/sequelize/models/EmailVerificationLink'
import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'
import TransactionService from '../../../shared/services/TransactionService'

class UpdateEmailVerificationLinkService extends TransactionService {
  async execute({ id }) {
    const transaction = await this.createTransaction()

    try {
      const existingLink = await EmailVerificationLink.findByPk(id)

      if (!existingLink) {
        throw new NotFoundError('Este link é inválido')
      }

      if (existingLink.verified) {
        return
      }

      await existingLink.update(
        {
          verified: true,
        },
        { transaction }
      )

      const user = await User.findByPk(existingLink.user_id)

      await user.update({ email_verified: true }, { transaction })

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()

      throw error
    }
  }
}

export default new UpdateEmailVerificationLinkService()
