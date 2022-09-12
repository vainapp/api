import UpdateAccountVerificationLinkService from '../../../services/UpdateAccountVerificationLinkService'
import { websiteHost } from '../../../../../shared/constants/website'

class AccountVerificationLinkController {
  async update(request, response) {
    const { account_verification_link_id } = request.params

    await UpdateAccountVerificationLinkService.execute({
      id: account_verification_link_id,
    })

    return response.redirect(`${websiteHost}/account-verified`)
  }
}

export default new AccountVerificationLinkController()
