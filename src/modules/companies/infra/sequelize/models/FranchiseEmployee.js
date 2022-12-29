import Sequelize, { Model } from 'sequelize'

class FranchiseEmployee extends Model {
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
        employee_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        franchise_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
      },
      { sequelize }
    )

    return this
  }
}

export default FranchiseEmployee
