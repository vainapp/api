import StoreForgotPasswordService from '../services/StoreForgotPasswordService'
import ShowForgotPasswordService from '../services/ShowForgotPasswordService'
// import UpdateForgotPasswordService from '../services/UpdateForgotPasswordService'

class ForgotPasswordController {
  async store(request, response) {
    const { email } = request.body

    const result = await StoreForgotPasswordService.execute({ email })

    return response.json(result)
  }

  async show(request, response) {
    const { email, code } = request.body

    const result = await ShowForgotPasswordService.execute({ email, code })

    return response.json(result)
  }

  // async update(request, response) {
  //   const { token, password, passwordConfirmation } = request.body

  //   const result = await UpdateForgotPasswordService.execute({
  //     recoveryCodeId: token,
  //     password,
  //     passwordConfirmation,
  //   })

  //   return response.json(result)
  // }
}

export default new ForgotPasswordController()
