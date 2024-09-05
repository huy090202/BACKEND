'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Categories', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4
    });

    await queryInterface.changeColumn('Categories', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Categories', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: null
    });

    await queryInterface.changeColumn('Categories', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false
    });
  }
};
