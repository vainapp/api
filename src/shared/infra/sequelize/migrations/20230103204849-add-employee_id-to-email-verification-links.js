module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('email_verification_links', 'employee_id', {
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
    await queryInterface.removeColumn('email_verification_links', 'employee_id')
  },
}
