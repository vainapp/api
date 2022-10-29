module.exports = {
  up: (queryInterface) => queryInterface.removeColumn('users', 'verified'),

  down: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }),
}
