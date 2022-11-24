import EmailVerificationLink from '../infra/sequelize/models/EmailVerificationLink'
import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'

class UpdateEmailVerificationLinkService {
  async execute({ id }) {
    const existingLink = await EmailVerificationLink.findByPk(id)

    if (!existingLink) {
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
