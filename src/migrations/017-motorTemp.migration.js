'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('MotorTemps', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: false,
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
        return await queryInterface.dropTable('MotorTemps');
    }
}