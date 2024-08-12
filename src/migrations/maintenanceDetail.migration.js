'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.createTable('MaintenanceDetails', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            part_cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            total_part_cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            labor_cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            maintenance_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Maintenances',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            part_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'MotorcycleParts',
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
        return queryInterface.dropTable('MaintenanceDetails');
    },
}