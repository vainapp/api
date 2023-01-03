module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('companies', 'customer_id', {
      type: Sequelize.STRING,
      allowNull: true,
    }),

  down: (queryInterface) =>
    queryInterface.removeColumn('companies', 'customer_id'),
}
