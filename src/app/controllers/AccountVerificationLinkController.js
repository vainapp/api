import UpdateAccountVerificationLinkService from '../services/UpdateAccountVerificationLinkService'
import { websiteHost } from '../../constants/website'

class AccountVerificationLinkController {
  async update(request, response) {
    const { account_verification_link_id } = request.params

    await UpdateAccountVerificationLinkService.execute({
      id: account_verification_link_id,
      response,
    })

    return response.redirect(`${websiteHost}/account-verified`)
  }
}

export default new AccountVerificationLinkController()
