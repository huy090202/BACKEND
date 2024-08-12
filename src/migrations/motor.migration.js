'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('Motors', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            motor_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            motor_type: {
                type: Sequelize.ENUM('UNDERBONE', 'SCOOTER', 'MANUAL', 'BIGBIKE'),
                allowNull: false,
                defaultValue: 'UNDERBONE',
            },
            motor_color: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            license_plate: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            cavet: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            image_part: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            motor_model: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        return await queryInterface.dropTable('Motors');
    }
}