import BadRequestError from '../errors/BadRequest'
import ForbiddenError from '../errors/Forbidden'
import User from '../models/User'
import AccountVerificationLink from '../models/AccountVerificationLink'
import Queue from '../../lib/Queue'
import AccountVerificationEmailJob from '../jobs/AccountVerificationEmail'
import isProduction from '../../helpers/isProduction'

class StoreUserService {
  async execute({ email, name, password, passwordConfirmation }) {
    if (password !== passwordConfirmation) {
      throw new BadRequestError('As senhas precisam ser iguais')
    }

    const emailInUse = await User.findOne({
      where: { email },
    })

    if (emailInUse?.verified) {
      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

    const [existingLink, newLink] = await AccountVerificationLink.findOrCreate({
      where: {
        user_id: emailInUse.id,
        verified: false,
      },
    })

    const verificationEmailParams = {
      toAddresses: [email],
      sourceAddress: process.env.EMAIL_ADDRESS_NO_REPLY,
      template: 'VERIFY_ACCOUNT',
      templateData: {
        name: emailInUse.name,
        link: `${process.env.APP_HOST}${
          !isProduction() ? `:${process.env.APP_PORT}` : ''
        }/verify/${(existingLink || newLink).id}`,
      },
      replyToAddresses: [process.env.EMAIL_ADDRESS_NO_REPLY],
    }

    if (emailInUse) {
      await Queue.add(AccountVerificationEmailJob.key, verificationEmailParams)

      return {
        id: emailInUse.id,
        email: emailInUse.email,
      }
    }

    const { id } = await User.create({
      email,
      name,
      password,
    })

    await Queue.add(AccountVerificationEmailJob.key, verificationEmailParams)

    return {
      id,
      email,
    }
  }
}

export default new StoreUserService()
