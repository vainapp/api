import jwt from 'jsonwebtoken'

import authConfig from '../../../config/auth'
import { LONG_TERM_DATA_DURATION } from '../../../config/redis'
import ForbiddenError from '../../../shared/errors/Forbidden'
import buildDirectEmailParams from '../../../shared/helpers/buildDirectEmailParams'
import generateRandomCode from '../../../shared/helpers/generateRandomCode'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import PhoneNumberVerificationCode from '../../../shared/infra/sequelize/models/PhoneNumberVerificationCode'
import SendEmailJob from '../../../shared/jobs/SendEmail'
import SendSMSJob from '../../../shared/jobs/SendSMS'
import Queue from '../../../shared/lib/Queue'
import CacheService from '../../../shared/services/CacheService'
import User from '../infra/sequelize/models/User'

class StoreSessionService {
  async execute({ email, password }) {
    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      throw new ForbiddenError('Dados de acesso inválidos')
    }

    const passwordMatch = await user.checkPassword(password)
    if (!passwordMatch) {
      throw new ForbiddenError('Dados de acesso inválidos')
    }

    if (!user.verified) {
      const [existingLink, newLink] = await EmailVerificationLink.findOrCreate({
        where: {
          user_id: user.id,
          verified: false,
        },
      })

      const [
        existingPhoneNumberVerificationCode,
        newPhoneNumberVerificationCode,
      ] = await PhoneNumberVerificationCode.findOrCreate({
        where: {
          user_id: user.id,
          verified: false,
        },
        defaults: {
          code: generateRandomCode(),
        },
      })

      const verificationEmailParams = await buildDirectEmailParams({
        toAddress: email,
        template: 'USER_VERIFY_EMAIL',
        templateData: {
          name: user.name,
          action_url: `${process.env.API_URL}/users/verify-email/${
            (existingLink || newLink).id
          }`,
        },
      })

      await Queue.add(SendEmailJob.key, verificationEmailParams)
      await Queue.add(SendSMSJob.key, {
        phone: user.phone_number,
        message: `Olá ${user.name}, seu código de confirmação é: ${
          !existingPhoneNumberVerificationCode
            ? newPhoneNumberVerificationCode.code
            : existingPhoneNumberVerificationCode.code
        }`,
      })

      return {
        needs_verification: true,
      }
    }

    const { id, name, phone_number } = user

    const accessToken = jwt.sign({}, authConfig.secret, {
      subject: id,
      expiresIn: authConfig.accessToken.expiresIn,
      audience: authConfig.accessToken.audience,
    })
    const refreshToken = jwt.sign({}, authConfig.secret, {
      subject: id,
      expiresIn: authConfig.refreshToken.expiresIn,
      audience: authConfig.refreshToken.audience,
    })

    await CacheService.save(
      `refresh-token:${refreshToken}`,
      id,
      LONG_TERM_DATA_DURATION
    )

    return {
      user: {
        id,
        name,
        email,
        phone_number,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }
}

export default new StoreSessionService()
