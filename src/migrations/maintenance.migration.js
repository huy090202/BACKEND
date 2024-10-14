'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('Maintenances', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4
            },
            status: {
                type: Sequelize.ENUM("RECEIVING", "INSPECTING", "UNDER_MAINTENANCE", "COMPLETED", "CANCELED"),
                defaultValue: 'RECEIVING',
                allowNull: false,
            },
            maintenance_date: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            notes_before: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            notes_after: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            wear_percentage_before: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            wear_percentage_after: {
                type: Sequelize.INTEGER,
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
            motor_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Motors',
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
        return queryInterface.dropTable('Maintenances');
    },
}