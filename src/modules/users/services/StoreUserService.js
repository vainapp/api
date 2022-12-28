import BadRequestError from '../../../shared/errors/BadRequest'
import ForbiddenError from '../../../shared/errors/Forbidden'
import User from '../infra/sequelize/models/User'
import Address from '../infra/sequelize/models/Address'
import EmailVerificationLink from '../infra/sequelize/models/EmailVerificationLink'
import PhoneNumberVerificationCode from '../infra/sequelize/models/PhoneNumberVerificationCode'
import Queue from '../../../shared/lib/Queue'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import SendSMSJob from '../../../shared/jobs/SendSMS'
import isProduction from '../../../shared/helpers/isProduction'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import generateRandomCode from '../../../shared/helpers/generateRandomCode'

class StoreUserService {
  async execute({
    email,
    phone_number,
    name,
    password,
    password_confirmation,
    address,
    genre,
  }) {
    if (password !== password_confirmation) {
      throw new BadRequestError('As senhas precisam ser iguais')
    }

    const existingUser = await User.findOne({
      where: { email },
    })

    if (existingUser?.verified) {
      throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
    }

    let userId

    if (!existingUser) {
      const { id } = await User.create({
        email,
        phone_number,
        name,
        password,
        genre,
      })

      userId = id
    } else {
      userId = existingUser.id

      existingUser.phone_number = phone_number
      existingUser.name = name
      existingUser.password = password
      existingUser.genre = genre

      await existingUser.save()
    }

    const [existingLink, newLink] = await EmailVerificationLink.findOrCreate({
      where: {
        user_id: userId,
        verified: false,
      },
    })

    const [
      existingPhoneNumberVerificationCode,
      newPhoneNumberVerificationCode,
    ] = await PhoneNumberVerificationCode.findOrCreate({
      where: {
        user_id: userId,
        verified: false,
      },
      defaults: {
        code: generateRandomCode(),
      },
    })

    const verificationEmailParams = await buildDirectEmailParams({
      toAddress: email,
      template: 'VERIFY_ACCOUNT',
      templateData: {
        name,
        link: `${process.env.APP_HOST}${
          !isProduction() ? `:${process.env.PORT}` : ''
        }/users/verify-email/${(existingLink || newLink).id}`,
      },
    })

    await Queue.add(SendEmailJob.key, verificationEmailParams)
    await Queue.add(SendSMSJob.key, {
      phone: phone_number,
      message: `Olá ${name}, seu código de confirmação é: ${
        !existingPhoneNumberVerificationCode
          ? newPhoneNumberVerificationCode.code
          : existingPhoneNumberVerificationCode.code
      }`,
    })

    if (existingUser) {
      await Address.destroy({
        where: {
          user_id: userId,
        },
      })
    }

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
