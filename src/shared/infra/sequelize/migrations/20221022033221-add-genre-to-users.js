module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'genre', {
      type: Sequelize.ENUM('female', 'male', 'other'),
      allowNull: false,
    }),

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'genre')
    await queryInterface.sequelize.query('DROP TYPE "enum_users_genre";')
  },
}
