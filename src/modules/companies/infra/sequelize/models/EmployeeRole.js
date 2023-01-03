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
      { sequelize, tableName: 'employees_roles' }
    )

    return this
  }

  static associate(models) {
    this.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    })
  }
}

export default EmployeeRole
