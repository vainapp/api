module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('forgot_password_codes', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('forgot_password_codes', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
    })
  },
}
