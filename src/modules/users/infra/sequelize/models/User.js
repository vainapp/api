import Sequelize from 'sequelize'

import AuthenticableEntity from '../../../../../shared/infra/sequelize/models/AuthenticableEntity'

class User extends AuthenticableEntity {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
          unique: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        genre: {
          type: Sequelize.ENUM('female', 'male', 'other'),
          allowNull: false,
        },
        phone_number: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        phone_number_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        profile_photo_id: {
          type: Sequelize.UUID,
          allowNull: true,
          unique: true,
        },
        verified: {
          type: Sequelize.VIRTUAL,
          get() {
            return this.email_verified && this.phone_number_verified
          },
        },
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      { sequelize }
    )

    this.addHook('beforeSave', async (user) => {
      await this.beforeSaveLogic(user)
    })

    return this
  }
}

export default User
