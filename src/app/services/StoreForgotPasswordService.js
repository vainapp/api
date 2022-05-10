import ForgotPasswordCode from '../models/ForgotPasswordCode'
import User from '../models/User'
import NotFoundError from '../errors/NotFound'
import Queue from '../../lib/Queue'
import SendEmailJob from '../jobs/SendEmail'
import buildDirectEmailParams from '../../helpers/buildDirectEmailParams'
import { help } from '../../constants/emails'

class StoreForgotPasswordService {
  async execute({ email }) {
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
      await forgotPasswordCode.update({ active: false })
    }

    const { code } = await ForgotPasswordCode.create({
      user_id: user.id,
    })

    const forgotPasswordParams = buildDirectEmailParams({
      toAddress: user.email,
      template: 'FORGOT_PASSWORD',
      templateData: {
        name: user.name,
        code,
        helpEmailAddress: help,
      },
    })

    await Queue.add(SendEmailJob.key, forgotPasswordParams)
  }
}

export default new StoreForgotPasswordService()
