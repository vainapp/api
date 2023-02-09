import Sequelize from 'sequelize'

import AuthenticableEntity from './AuthenticableEntity'

class Employee extends AuthenticableEntity {
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

    this.addHook('beforeSave', async (employee) => {
      await this.beforeSaveLogic(employee)
    })

    this.addHook('beforeUpdate', async (employee) => {
      await this.beforeSaveLogic(employee)
    })

    return this
  }

  static associate(models) {
    this.hasMany(models.EmployeeRole)
  }
}

export default Employee
