import StoreUserService from '../../../services/StoreUserService'

class UserController {
  async store(request, response) {
    const { email, name, password, passwordConfirmation } = request.body

    const result = await StoreUserService.execute({
      email,
      name,
      password,
      passwordConfirmation,
    })

    return response.json(result)
  }
}

export default new UserController()
