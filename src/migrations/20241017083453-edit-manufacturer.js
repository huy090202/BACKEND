'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Manufacturers', 'contry', 'country');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Manufacturers', 'country', 'contry');
  }
};
