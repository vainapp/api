module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('employees', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('employees', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    }),
}
