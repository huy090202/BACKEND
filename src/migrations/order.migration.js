'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('Orders', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            order_code: {
                type: Sequelize.STRING(6),
                allowNull: false,
                unique: true,
            },
            total_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            order_status: {
                type: Sequelize.ENUM("PENDING", "CONFIRMED", "PREPARING", "SHIPPING", "DELIVERED", "CANCELED", "INVALID", "FAILED"),
                defaultValue: 'PENDING',
                allowNull: false,
            },
            payment_status: {
                type: Sequelize.ENUM('UNPAID', 'PAID'),
                defaultValue: 'UNPAID',
            },
            payment_method: {
                type: Sequelize.ENUM('COD', 'PAYPAL'),
                defaultValue: 'COD',
            },
            delivery_method: {
                type: Sequelize.ENUM('DELIVERY', 'CARRYOUT'),
                defaultValue: 'DELIVERY',
            },
            order_date: {
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
        return await queryInterface.dropTable('Orders');
    },
}