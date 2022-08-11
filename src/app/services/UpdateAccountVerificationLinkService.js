import AccountVerificationLink from '../models/AccountVerificationLink'
import User from '../models/User'
import NotFoundError from '../errors/NotFound'
import { websiteHost } from '../../constants/website'

class UpdateAccountVerificationLinkService {
  async execute({ id, response }) {
    const existingLink = await AccountVerificationLink.findByPk(id)

    if (!existingLink) {
      throw new NotFoundError('Este link é inválido')
    }

    if (existingLink.verified) {
      response.redirect(`${websiteHost}/expired-link`)
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
