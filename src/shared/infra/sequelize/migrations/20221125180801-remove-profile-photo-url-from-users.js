module.exports = {
  up: (queryInterface) =>
    queryInterface.removeColumn('users', 'profile_photo_url'),

  down: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'profile_photo_url', {
      type: Sequelize.STRING,
      defaultValue: null,
      allowNull: true,
    }),
}
