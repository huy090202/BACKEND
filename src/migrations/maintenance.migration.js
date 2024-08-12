'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('Maintenances', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            maintenance_code: {
                type: Sequelize.STRING(6),
                allowNull: false,
                unique: true,
            },
            status: {
                type: Sequelize.ENUM("RECEIVING", "INSPECTING", "UNDER_MAINTENANCE", "COMPLETED", "CANCELED"),
                defaultValue: 'RECEIVING',
                allowNull: false,
            },
            total_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            total_cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            maintenance_date: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
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
        return queryInterface.dropTable('Maintenances');
    },
}