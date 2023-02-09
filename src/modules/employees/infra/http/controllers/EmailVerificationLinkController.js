import querystring from 'node:querystring'

import StoreEmailVerificationLinkService from '../../../services/StoreEmailVerificationLinkService'
import UpdateEmailVerificationLinkService from '../../../services/UpdateEmailVerificationLinkService'

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

    const { needs_sms_verification, employee_id } =
      await UpdateEmailVerificationLinkService.execute({
        id: email_verification_link_id,
      })

    const queryParams = {
      employee_id,
      needs_sms_verification,
    }

    return response.redirect(
      `${
        process.env.APP_WEB_URL
      }/employee-email-verified?${querystring.stringify(queryParams)}`
    )
  }
}

export default new EmailVerificationLinkController()
