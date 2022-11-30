import UpdatePasswordService from '../../../services/UpdatePasswordService'

class UpdatePasswordController {
  async update(request, response) {
    const { current_password, new_password, new_password_confirmation } =
      request.body

    await UpdatePasswordService.execute({
      current_password,
      new_password,
      new_password_confirmation,
      user_id: request.user.id,
    })

    return response.sendStatus(200)
  }
}

export default new UpdatePasswordController()
