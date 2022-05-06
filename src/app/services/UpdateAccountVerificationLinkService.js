import AccountVerificationLink from '../models/AccountVerificationLink'
import User from '../models/User'
import NotFoundError from '../errors/NotFound'
import ForbiddenError from '../errors/Forbidden'

class UpdateAccountVerificationLinkService {
  async execute({ id }) {
    const existingLink = await AccountVerificationLink.findByPk(id)

    if (!existingLink) {
      throw new NotFoundError('Este link é inválido')
    }

    if (existingLink.verified) {
      throw new ForbiddenError('Este link está expirado')
    }

    await existingLink.update({
      verified: true,
    })

    const user = await User.findByPk(existingLink.user_id)

    await user.update({ verified: true })
  }
}

export default new UpdateAccountVerificationLinkService()
