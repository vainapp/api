import Sequelize, { Model } from 'sequelize'

class EmployeeRole extends Model {
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
        role: {
          type: Sequelize.ENUM('ADMIN', 'MANAGER', 'EMPLOYEE'),
          allowNull: false,
        },
        employee_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
      },
      { sequelize }
    )

    return this
  }
}

export default EmployeeRole
