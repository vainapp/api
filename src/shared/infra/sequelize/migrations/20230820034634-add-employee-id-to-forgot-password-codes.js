module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('forgot_password_codes', 'employee_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('forgot_password_codes', 'employee_id')
  },
}
