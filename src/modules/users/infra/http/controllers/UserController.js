import ShowUserService from '../../../services/ShowUserService'
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

  async show(request, response) {
    const result = await ShowUserService.execute({
      user_id: request.user.id,
    })

    return response.json(result)
  }
}

export default new UserController()
