import { NotFoundError } from '../../../shared/errors'
import ProfilePhoto from '../infra/sequelize/models/ProfilePhoto'

class DeleteProfilePhotoService {
  async execute({ profilePhotoId, userId }) {
    const profilePhoto = await ProfilePhoto.findByPk(profilePhotoId)

    if (!profilePhoto || profilePhoto.user_id !== userId) {
      throw new NotFoundError('Imagem de perfil não encontrada')
    }

    await profilePhoto.destroy()
  }
}

export default new DeleteProfilePhotoService()
