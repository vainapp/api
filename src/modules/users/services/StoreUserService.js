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
import TransactionService from '../../../shared/services/TransactionService'

class StoreUserService extends TransactionService {
  async execute({
    email,
    phone_number,
    name,
    password,
    passwordConfirmation,
    address,
    genre,
  }) {
    const transaction = await this.createTransaction()

    try {
      if (password !== passwordConfirmation) {
        throw new BadRequestError('As senhas precisam ser iguais')
      }

      const userWithSameEmail = await User.findOne({
        where: { email },
      })

      if (userWithSameEmail?.email_verified) {
        throw new ForbiddenError('Este endereço de e-mail já está cadastrado')
      }

      let userId

      if (!userWithSameEmail) {
        const { id } = await User.create(
          {
            email,
            phone_number,
            name,
            password,
            genre,
          },
          { transaction }
        )

        userId = id
      } else {
        userId = userWithSameEmail.id
      }

      const [existingLink, newLink] = await EmailVerificationLink.findOrCreate({
        where: {
          user_id: userId,
          verified: false,
        },
        transaction,
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
        transaction,
      })

      const verificationEmailParams = await buildDirectEmailParams({
        toAddress: email,
        template: 'VERIFY_ACCOUNT',
        templateData: {
          name,
          link: `${process.env.APP_HOST}${
            !isProduction() ? `:${process.env.APP_PORT}` : ''
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

      if (userWithSameEmail) {
        return {
          id: userId,
          email: userWithSameEmail.email,
        }
      }

      await Address.create(
        {
          ...address,
          user_id: userId,
          transaction,
        },
        { transaction }
      )

      await transaction.commit()

      return {
        id: userId,
        email,
      }
    } catch (error) {
      await transaction.rollback()

      throw error
    }
  }
}

export default new StoreUserService()
