module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('addresses', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('addresses', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }),
}
