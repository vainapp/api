module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'genre', {
      type: Sequelize.ENUM('female', 'male', 'other'),
      allowNull: false,
    }),

  down: (queryInterface) => queryInterface.removeColumn('users', 'genre'),
}
