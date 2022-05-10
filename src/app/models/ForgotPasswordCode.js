import Sequelize, { Model } from 'sequelize'

import generateRandomCode from '../../helpers/generateRandomCode'

class ForgotPasswordCode extends Model {
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
        user_id: Sequelize.UUID,
        code: Sequelize.STRING(4),
        active: Sequelize.BOOLEAN,
      },
      { sequelize }
    )

    this.addHook('beforeCreate', async (forgotPasswordCode) => {
      forgotPasswordCode.code = generateRandomCode()
    })

    return this
  }
}

export default ForgotPasswordCode
