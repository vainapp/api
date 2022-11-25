import StoreProfilePhotoService from '../../../services/StoreProfilePhotoService'

class ProfilePhotoController {
  async store(request, response) {
    const { originalname: name, size, key, location: url = '' } = request.file

    const result = await StoreProfilePhotoService.execute({
      name,
      size,
      key,
      url,
      userId: request.user.id,
    })

    return response.json(result)
  }

  async delete(request, response) {
    return response.sendStatus(200) // TODO choose the best http code status
  }
}

export default new ProfilePhotoController()
