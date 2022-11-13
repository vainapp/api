import ForgotPasswordCode from '../infra/sequelize/models/ForgotPasswordCode'
import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'
import Queue from '../../../shared/lib/Queue'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import { help } from '../../../shared/constants/emails'
import TransactionService from '../../../shared/services/TransactionService'

class StoreForgotPasswordService extends TransactionService {
  async execute({ email }) {
    try {
      const user = await User.findOne({
        where: {
          email,
          verified: true,
        },
      })

      if (!user) {
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
        await forgotPasswordCode.update(
          { active: false },
          { transaction: this.transaction }
        )
      }

      const { code } = await ForgotPasswordCode.create(
        {
          user_id: user.id,
        },
        { transaction: this.transaction }
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

      await this.transaction.commit()

      await Queue.add(SendEmailJob.key, forgotPasswordParams)
    } catch (error) {
      await this.transaction.rollback()

      throw error
    }
  }
}

export default new StoreForgotPasswordService()
