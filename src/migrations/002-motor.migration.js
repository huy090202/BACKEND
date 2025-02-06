'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('Motors', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4
            },
            motor_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            motor_type: {
                type: Sequelize.ENUM('Xe số', 'Xe ga', 'Xe côn', 'Xe phân khối lớn', 'Xe khác'),
                allowNull: false,
                defaultValue: 'Xe số',
            },
            motor_color: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            license_plate: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            engine_number: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            chassis_number: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            created_at: {
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