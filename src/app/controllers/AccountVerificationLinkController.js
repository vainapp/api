import UpdateAccountVerificationLinkService from '../services/UpdateAccountVerificationLinkService'

class AccountVerificationLinkController {
  async update(request, response) {
    const { account_verification_link_id } = request.params

    await UpdateAccountVerificationLinkService.execute({
      id: account_verification_link_id,
    })

    // TODO redirect to a web page saying that's everything ok with your account
    return response.redirect('https://jopcmelo.dev')
  }
}

export default new AccountVerificationLinkController()
