import Sequelize, { Model } from 'sequelize'

class EmailVerificationLink extends Model {
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

    this.addHook('beforeSave', async (emailVerificationLink) => {
      if (
        !emailVerificationLink.user_id &&
        !emailVerificationLink.employee_id
      ) {
        throw new Error(
          'provide either user_id or employee_id to create a new email verification link'
        )
      }
    })

    return this
  }
}

export default EmailVerificationLink
