import UpdatePasswordService from '../../../services/UpdatePasswordService'

class UpdatePasswordController {
  async update(request, response) {
    const { currentPassword, newPassword, newPasswordConfirmation } =
      request.body

    await UpdatePasswordService.execute({
      currentPassword,
      newPassword,
      newPasswordConfirmation,
      userId: request.user.id,
    })

    return response.sendStatus(200)
  }
}

export default new UpdatePasswordController()
