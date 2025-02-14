import NotFoundError from '../../../shared/errors/NotFound'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import ForgotPasswordCode from '../../../shared/infra/sequelize/models/ForgotPasswordCode'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'
import User from '../infra/sequelize/models/User'

class StoreForgotPasswordService {
  async execute({ email }) {
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
      await forgotPasswordCode.update({ active: false })
    }

    const { code } = await ForgotPasswordCode.create({
      user_id: user.id,
    })

    const forgotPasswordParams = await buildDirectEmailParams({
      toAddress: user.email,
      template: 'USER_FORGOT_PASSWORD',
      templateData: {
        name: user.name,
        code,
      },
    })

    await Queue.add(SendEmailJob.key, forgotPasswordParams)
  }
}

export default new StoreForgotPasswordService()
