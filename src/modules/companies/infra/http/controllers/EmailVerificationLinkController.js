import querystring from 'node:querystring'

import StoreEmailVerificationLinkService from '../../../services/StoreEmailVerificationLinkService'
import UpdateEmailVerificationLinkService from '../../../services/UpdateEmailVerificationLinkService'

class EmailVerificationLinkController {
  async store(request, response) {
    const { email, price_id } = request.body

    await StoreEmailVerificationLinkService.execute({
      email,
      price_id,
    })

    return response.sendStatus(200)
  }

  async update(request, response) {
    const { email_verification_link_id } = request.params
    const { price_id } = request.query

    const { needs_sms_verification, employee_id } =
      await UpdateEmailVerificationLinkService.execute({
        id: email_verification_link_id,
        price_id,
      })

    const queryParams = {
      price_id,
      employee_id,
      needs_sms_verification,
    }

    return response.redirect(
      `${
        process.env.APP_WEB_URL
      }/company-email-verified?${querystring.stringify(queryParams)}`
    )
  }
}

export default new EmailVerificationLinkController()
