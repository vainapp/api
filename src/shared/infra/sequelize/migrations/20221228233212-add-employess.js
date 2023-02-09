module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('employees', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      phone_number_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }),

  down: (queryInterface) => queryInterface.dropTable('employees'),
}
