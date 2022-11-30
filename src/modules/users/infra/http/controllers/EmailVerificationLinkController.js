import UpdateEmailVerificationLinkService from '../../../services/UpdateEmailVerificationLinkService'
import StoreEmailVerificationLinkService from '../../../services/StoreEmailVerificationLinkService'
import { websiteHost } from '../../../../../shared/constants/website'

class EmailVerificationLinkController {
  async store(request, response) {
    const { email } = request.body

    await StoreEmailVerificationLinkService.execute({
      email,
    })

    return response.sendStatus(200)
  }

  async update(request, response) {
    const { email_verification_link_id } = request.params

    await UpdateEmailVerificationLinkService.execute({
      id: email_verification_link_id,
    })

    return response.redirect(`${websiteHost}/email-verificado`)
  }
}

export default new EmailVerificationLinkController()
