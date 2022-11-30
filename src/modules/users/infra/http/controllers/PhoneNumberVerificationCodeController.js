import StorePhoneNumberVerificationCodeService from '../../../services/StorePhoneNumberVerificationCodeService'
import UpdatePhoneNumberVerificationCodeService from '../../../services/UpdatePhoneNumberVerificationCodeService'

class PhoneNumberVerificationCodeController {
  async store(request, response) {
    const { email } = request.body

    await StorePhoneNumberVerificationCodeService.execute({
      email,
    })

    return response.sendStatus(200)
  }

  async update(request, response) {
    const { user_id, code } = request.body

    await UpdatePhoneNumberVerificationCodeService.execute({
      userId: user_id,
      code,
    })

    return response.sendStatus(200)
  }
}

export default new PhoneNumberVerificationCodeController()
