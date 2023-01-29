import ShowForgotPasswordService from '../../../services/ShowForgotPasswordService'
import StoreForgotPasswordService from '../../../services/StoreForgotPasswordService'
import UpdateForgotPasswordService from '../../../services/UpdateForgotPasswordService'

class ForgotPasswordController {
  async store(request, response) {
    const { email } = request.body

    await StoreForgotPasswordService.execute({ email })

    return response.status(204).send()
  }

  async show(request, response) {
    const { email, code } = request.body

    const result = await ShowForgotPasswordService.execute({ email, code })

    return response.json(result)
  }

  async update(request, response) {
    const { token, password, password_confirmation } = request.body

    await UpdateForgotPasswordService.execute({
      forgot_password_code_id: token,
      password,
      password_confirmation,
    })

    return response.status(204).send()
  }
}

export default new ForgotPasswordController()
