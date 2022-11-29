import ProfilePhoto from '../infra/sequelize/models/ProfilePhoto'
import User from '../infra/sequelize/models/User'

class StoreProfilePhotoService {
  async execute({ name, size, key, url, userId }) {
    const profilePhoto = await ProfilePhoto.create({
      user_id: userId,
      name,
      size,
      key,
      url,
    })

    const user = await User.findByPk(userId)

    if (user.profile_photo_id) {
      await ProfilePhoto.destroy({
        where: {
          id: user.profile_photo_id,
        },
      })
    }

    user.profile_photo_id = profilePhoto.id
    await user.save()

    return profilePhoto
  }
}

export default new StoreProfilePhotoService()
