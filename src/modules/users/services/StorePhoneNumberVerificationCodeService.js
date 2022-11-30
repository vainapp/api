import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'
import { ForbiddenError } from '../../../shared/errors'
import Queue from '../../../shared/lib/Queue'
import SendSMSJob from '../../../shared/jobs/SendSMS'
import PhoneNumberVerificationCode from '../infra/sequelize/models/PhoneNumberVerificationCode'

class StorePhoneNumberVerificationCodeService {
  async execute({ email }) {
    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      throw new NotFoundError('Endereço de e-mail não encontrado')
    }

    if (user.phone_number_verified) {
      throw new ForbiddenError('Número de telefone já verificado')
    }

    const phoneNumberVerificationCode =
      await PhoneNumberVerificationCode.findOne({
        where: { user_id: user.id, verified: false },
      })

    if (!phoneNumberVerificationCode) {
      throw new NotFoundError(
        'Código de verificação de telefone não encontrado'
      )
    }

    await Queue.add(SendSMSJob.key, {
      phone: user.phone_number,
      message: `Olá ${user.name}, seu código de confirmação é: ${phoneNumberVerificationCode.code}`,
    })
  }
}

export default new StorePhoneNumberVerificationCodeService()
