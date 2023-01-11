import NotFoundError from '../../../shared/errors/NotFound'
import PhoneNumberVerificationCode from '../../../shared/infra/sequelize/models/PhoneNumberVerificationCode'
import User from '../infra/sequelize/models/User'

class UpdatePhoneNumberVerificationCodeService {
  async execute({ userId, code }) {
    const user = await User.findByPk(userId)

    if (!user) {
      throw new NotFoundError('Código de verificação inválido')
    }

    const existingCode = await PhoneNumberVerificationCode.findOne({
      where: {
        user_id: userId,
        code,
      },
    })

    if (!existingCode) {
      throw new NotFoundError('Código de verificação inválido')
    }

    if (existingCode.verified) {
      return
    }

    await existingCode.update({
      verified: true,
    })

    await user.update({ phone_number_verified: true })
  }
}

export default new UpdatePhoneNumberVerificationCodeService()
