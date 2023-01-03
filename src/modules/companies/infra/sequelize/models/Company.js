import Sequelize, { Model } from 'sequelize'

class Company extends Model {
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
        admin_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        product_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        price_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        customer_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      },
      { sequelize }
    )

    return this
  }
}

export default Company
