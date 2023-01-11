module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'subscription_active_until', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('companies', 'subscription_active_until')
  },
}
