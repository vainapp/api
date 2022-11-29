module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'profile_photo_id', {
      type: Sequelize.UUID,
      allowNull: true,
      unique: true,
      references: {
        model: 'profile_photos',
        key: 'id',
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL',
    }),

  down: (queryInterface) =>
    queryInterface.removeColumn('users', 'profile_photo_id'),
}
