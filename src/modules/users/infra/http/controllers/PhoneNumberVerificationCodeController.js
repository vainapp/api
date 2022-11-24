import UpdatePhoneNumberVerificationCodeService from '../../../services/UpdatePhoneNumberVerificationCodeService'

class PhoneNumberVerificationCodeController {
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
