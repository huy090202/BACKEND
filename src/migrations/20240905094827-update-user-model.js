'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: null // Hoàn tác defaultValue cho id
    });
  }
};
