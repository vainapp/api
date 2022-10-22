import BadRequestError from '../../../shared/errors/BadRequest'
import ForbiddenError from '../../../shared/errors/Forbidden'
import User from '../infra/sequelize/models/User'
import Address from '../infra/sequelize/models/Address'
import AccountVerificationLink from '../infra/sequelize/models/AccountVerificationLink'
import Queue from '../../../shared/lib/Queue'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import isProduction from '../../../shared/helpers/isProduction'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'

class StoreUserService {
  async execute({
    email,
    phone_number,
    name,
    password,
    passwordConfirmation,
    address,
    genre,
  }) {
    if (password !== passwordConfirmation) {
      throw new BadRequestError('As senhas precisam ser iguais')
    }

    const emailInUse = await User.findOne({
      where: { email },
    })

    if (emailInUse?.verified) {
      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

    let userId

    if (!emailInUse) {
      const { id } = await User.create({
        email,
        phone_number,
        name,
        password,
        genre,
      })

      userId = id
    } else {
      userId = emailInUse.id
    }

    const [existingLink, newLink] = await AccountVerificationLink.findOrCreate({
      where: {
        user_id: userId,
        verified: false,
      },
    })

    const verificationEmailParams = await buildDirectEmailParams({
      toAddress: email,
      template: 'VERIFY_ACCOUNT',
      templateData: {
        name,
        link: `${process.env.APP_HOST}${
          !isProduction() ? `:${process.env.APP_PORT}` : ''
        }/users/verify/${(existingLink || newLink).id}`,
      },
    })

    if (emailInUse) {
      await Queue.add(SendEmailJob.key, verificationEmailParams)

      return {
        id: userId,
        email: emailInUse.email,
      }
    }

    await Queue.add(SendEmailJob.key, verificationEmailParams)

    await Address.create({
      ...address,
      user_id: userId,
    })

    return {
      id: userId,
      email,
    }
  }
}

export default new StoreUserService()
