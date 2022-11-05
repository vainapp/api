import Sequelize, { Model } from 'sequelize'

import generateRandomCode from '../../../../../shared/helpers/generateRandomCode'

class PhoneNumberVerificationCode extends Model {
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
        code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
      },
      { sequelize }
    )

    this.addHook('beforeCreate', async (phoneNumberVerificationCode) => {
      phoneNumberVerificationCode.code = generateRandomCode()
    })

    return this
  }
}

export default PhoneNumberVerificationCode
