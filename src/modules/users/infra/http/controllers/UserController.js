import StoreUserService from '../../../services/StoreUserService'

class UserController {
  async store(request, response) {
    const { email, name, password, passwordConfirmation, address, genre } =
      request.body

    const result = await StoreUserService.execute({
      email,
      name,
      password,
      passwordConfirmation,
      address,
      genre,
    })

    return response.json(result)
  }
}

export default new UserController()
