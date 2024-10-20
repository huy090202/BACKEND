'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('MotorcycleParts', 'part_price', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn('MotorcycleParts', 'average_life', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('MotorcycleParts', 'part_price', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('MotorcycleParts', 'average_life', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
