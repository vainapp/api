import Address from '../infra/sequelize/models/Address'
import ProfilePhoto from '../infra/sequelize/models/ProfilePhoto'
import User from '../infra/sequelize/models/User'

class ShowUserService {
  async execute({ user_id }) {
    const user = await User.findByPk(user_id)

    const lastUpdatedProfilePhoto = await ProfilePhoto.findOne({
      where: { user_id },
      attributes: ['id', 'url'],
      order: [['updated_at', 'DESC']],
    })

    const addresses = await Address.findAll({
      where: { user_id },
      attributes: [
        'id',
        'street',
        'number',
        'complement',
        'district',
        'city',
        'state',
        'zip_code',
        'country',
      ],
      order: [['created_at', 'DESC']],
    })

    return {
      id: user.id,
      email: user.email,
      email_verified: user.email_verified,
      phone_number: user.phone_number,
      phone_number_verified: user.phone_number_verified,
      name: user.name,
      genre: user.genre,
      addresses,
      profile_photo: lastUpdatedProfilePhoto,
      created_at: user.createdAt,
    }
  }
}

export default new ShowUserService()
