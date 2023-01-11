module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'product_id', {
      type: Sequelize.STRING,
      defaultValue: null,
      allowNull: true,
    })

    await queryInterface.addColumn('companies', 'price_id', {
      type: Sequelize.STRING,
      defaultValue: null,
      allowNull: true,
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('companies', 'product_id')
    await queryInterface.removeColumn('companies', 'price_id')
  },
}
