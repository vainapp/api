import NotFoundError from '../../../shared/errors/NotFound'
import EmailVerificationLink from '../../../shared/infra/sequelize/models/EmailVerificationLink'
import User from '../infra/sequelize/models/User'

class UpdateEmailVerificationLinkService {
  async execute({ id }) {
    const existingLink = await EmailVerificationLink.findByPk(id)

    if (!existingLink || !existingLink.user_id) {
      throw new NotFoundError('Este link é inválido')
    }

    if (existingLink.verified) {
      return
    }

    await existingLink.update({
      verified: true,
    })

    const user = await User.findByPk(existingLink.user_id)

    await user.update({ email_verified: true })
  }
}

export default new UpdateEmailVerificationLinkService()
