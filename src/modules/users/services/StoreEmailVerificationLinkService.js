import { ForbiddenError } from '../../../shared/errors'
import NotFoundError from '../../../shared/errors/NotFound'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import Queue from '../../../shared/lib/Queue'
import User from '../infra/sequelize/models/User'

class StoreEmailVerificationLinkService {
  async execute({ email }) {
    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      throw new NotFoundError('Endereço de e-mail não encontrado')
    }

    if (user.email_verified) {
      throw new ForbiddenError('E-mail já verificado')
    }

    const emailVerificationLink = await EmailVerificationLink.findOne({
      where: { user_id: user.id, verified: false },
    })

    if (!emailVerificationLink) {
      throw new NotFoundError('Link de verificação de e-mail não encontrado')
    }

    const verificationEmailParams = await buildDirectEmailParams({
      toAddress: email,
      template: 'VERIFY_ACCOUNT',
      templateData: {
        name: user.name,
        link: `${process.env.API_URL}/users/verify-email/${emailVerificationLink.id}`,
      },
    })

    await Queue.add(SendEmailJob.key, verificationEmailParams)
  }
}

export default new StoreEmailVerificationLinkService()
