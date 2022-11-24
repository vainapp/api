module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: true,
    }),

  down: (queryInterface) =>
    queryInterface.removeColumn('users', 'phone_number'),
}
