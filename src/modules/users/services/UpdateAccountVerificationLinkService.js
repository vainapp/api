import AccountVerificationLink from '../infra/sequelize/models/AccountVerificationLink'
import User from '../infra/sequelize/models/User'
import NotFoundError from '../../../shared/errors/NotFound'

class UpdateAccountVerificationLinkService {
  async execute({ id }) {
    const existingLink = await AccountVerificationLink.findByPk(id)

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

    await user.update({ verified: true })
  }
}

export default new UpdateAccountVerificationLinkService()
