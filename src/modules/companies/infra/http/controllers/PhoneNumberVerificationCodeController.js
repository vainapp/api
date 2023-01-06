import UpdatePhoneNumberVerificationCodeService from '../../../services/UpdatePhoneNumberVerificationCodeService'

class PhoneNumberVerificationCodeController {
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
