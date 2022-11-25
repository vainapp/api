import ProfilePhoto from '../infra/sequelize/models/ProfilePhoto'

class StoreProfilePhotoService {
  async execute({ name, size, key, url, userId }) {
    const profilePhoto = await ProfilePhoto.create({
      user_id: userId,
      name,
      size,
      key,
      url,
    })

    return profilePhoto
  }
}

export default new StoreProfilePhotoService()
