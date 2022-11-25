import DeleteProfilePhotoService from '../../../services/DeleteProfilePhotoService'
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
    const { profile_photo_id } = request.params

    await DeleteProfilePhotoService.execute({
      profilePhotoId: profile_photo_id,
      userId: request.user.id,
    })

    return response.sendStatus(200)
  }
}

export default new ProfilePhotoController()
