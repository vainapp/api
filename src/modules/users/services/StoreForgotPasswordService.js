import ForgotPasswordCode from '../infra/sequelize/models/ForgotPasswordCode'
import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'
import TransactionService from '../../../shared/services/TransactionService'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import { help } from '../../../shared/constants/emails'
import Queue from '../../../shared/lib/Queue'
import SendEmailJob from '../../../shared/jobs/SendEmail'

class StoreForgotPasswordService extends TransactionService {
  async execute({ email }) {
    const transaction = await this.createTransaction()

    try {
      const user = await User.findOne({
        where: {
          email,
        },
      })

      if (!user || !user.verified) {
        throw new NotFoundError(
          'Este endereço de e-mail não está vinculado à uma conta verificada'
        )
      }

      const forgotPasswordCode = await ForgotPasswordCode.findOne({
        where: {
          user_id: user.id,
          active: true,
        },
      })

      if (forgotPasswordCode) {
        await forgotPasswordCode.update({ active: false }, { transaction })
      }

      const { code } = await ForgotPasswordCode.create(
        {
          user_id: user.id,
        },
        { transaction }
      )

      const forgotPasswordParams = await buildDirectEmailParams({
        toAddress: user.email,
        template: 'FORGOT_PASSWORD',
        templateData: {
          name: user.name,
          code,
          helpEmailAddress: help,
        },
      })

      await transaction.commit()

      await Queue.add(SendEmailJob.key, forgotPasswordParams)
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}

export default new StoreForgotPasswordService()
