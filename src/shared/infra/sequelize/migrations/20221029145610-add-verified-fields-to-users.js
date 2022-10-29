module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'email_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })

    await queryInterface.addColumn('users', 'phone_number_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'email_verified')
    await queryInterface.removeColumn('users', 'phone_number_verified')
  },
}
