import UpdateEmailVerificationLinkService from '../../../services/UpdateEmailVerificationLinkService'
import { websiteHost } from '../../../../../shared/constants/website'

class EmailVerificationLinkController {
  async update(request, response) {
    const { email_verification_link_id } = request.params

    await UpdateEmailVerificationLinkService.execute({
      id: email_verification_link_id,
    })

    return response.redirect(`${websiteHost}/account-verified`)
  }
}

export default new EmailVerificationLinkController()
