'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('USER', 'STAFF', 'TECH', 'CASHIER', 'ADMIN'),
      defaultValue: 'USER',
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('USER', 'STAFF', 'ADMIN'),
      defaultValue: 'USER',
    });
  }
};
