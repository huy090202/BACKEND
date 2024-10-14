'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('Invoices', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            payment_status: {
                type: Sequelize.ENUM('UNPAID', 'PAID'),
                defaultValue: 'UNPAID',
            },
            payment_method: {
                type: Sequelize.ENUM('COD', 'CARD', 'QR_CODE'),
                defaultValue: 'COD',
            },
            create_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
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
        return await queryInterface.dropTable('Invoices');
    },
}