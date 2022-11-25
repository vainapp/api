module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'profile_photo_url', {
      type: Sequelize.STRING,
      defaultValue: null,
      allowNull: true,
    }),

  down: (queryInterface) =>
    queryInterface.removeColumn('users', 'profile_photo_url'),
}
