import StoreUserService from '../../../services/StoreUserService'

class UserController {
  async store(request, response) {
    const {
      email,
      phone_number,
      name,
      password,
      passwordConfirmation,
      address,
      genre,
    } = request.body

    const result = await StoreUserService.execute({
      email,
      phone_number,
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
