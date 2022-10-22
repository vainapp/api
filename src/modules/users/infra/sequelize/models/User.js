import Sequelize, { Model } from 'sequelize'
import bcrypt from 'bcrypt'

import BadRequestError from '../../../../../shared/errors/BadRequest'

class User extends Model {
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
        verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
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
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      { sequelize }
    )

    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        // TODO move this check to validator
        if (user.password.length < 6) {
          throw new BadRequestError(
            'A senha precisa ter no mínimo 6 caracteres'
          )
        }

        user.password_hash = await bcrypt.hash(user.password, 8)
      }
    })

    return this
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash)
  }
}

export default User
