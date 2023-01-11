import bcrypt from 'bcrypt'
import { Model } from 'sequelize'

class AuthenticableEntity extends Model {
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash)
  }

  static async beforeSaveLogic(entity) {
    if (entity.password) {
      entity.password_hash = await bcrypt.hash(entity.password, 8)
    }
  }
}

export default AuthenticableEntity
