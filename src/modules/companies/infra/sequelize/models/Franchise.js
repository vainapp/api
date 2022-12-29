import Sequelize, { Model } from 'sequelize'

class Franchise extends Model {
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
        company_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
      },
      { sequelize }
    )

    return this
  }
}

export default Franchise
