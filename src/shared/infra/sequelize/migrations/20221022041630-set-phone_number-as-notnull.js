module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('users', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: false,
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('users', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: true,
    }),
}
