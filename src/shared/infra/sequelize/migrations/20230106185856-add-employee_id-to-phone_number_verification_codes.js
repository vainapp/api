module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'phone_number_verification_codes',
      'employee_id',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    )
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(
      'phone_number_verification_codes',
      'employee_id'
    )
  },
}
