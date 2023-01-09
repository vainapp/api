import Sequelize, { Model } from 'sequelize'

import isDateAfterNow from '../../../../../shared/helpers/isDateAfterNow'

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
        subscription_active_until: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        has_active_subscription: {
          type: Sequelize.VIRTUAL,
          get() {
            return isDateAfterNow(this.subscription_active_until)
          },
        },
      },
      { sequelize }
    )

    return this
  }
}

export default Company
