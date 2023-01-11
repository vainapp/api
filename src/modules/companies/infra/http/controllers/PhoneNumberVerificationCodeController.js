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
    const { employee_id, code } = request.body

    await UpdatePhoneNumberVerificationCodeService.execute({
      employee_id,
      code,
    })

    return response.sendStatus(200)
  }
}

export default new PhoneNumberVerificationCodeController()
