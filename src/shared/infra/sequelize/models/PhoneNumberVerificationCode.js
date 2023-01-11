import Sequelize, { Model } from 'sequelize'

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
          allowNull: true,
        },
        employee_id: {
          type: Sequelize.UUID,
          allowNull: true,
        },
      },
      { sequelize }
    )

    return this
  }
}

export default PhoneNumberVerificationCode
