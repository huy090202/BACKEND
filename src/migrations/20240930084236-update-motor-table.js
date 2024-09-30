'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Motors', 'engine_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Motors', 'chassis_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Motors', 'created_at', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn('Motors', 'cavet');

    await queryInterface.removeColumn('Motors', 'active');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Motors', 'engine_number');

    await queryInterface.removeColumn('Motors', 'chassis_number');

    await queryInterface.addColumn('Motors', 'cavet', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Motors', 'active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  }
};
