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
            invoices_code: {
                type: Sequelize.STRING(6),
                allowNull: false,
                unique: true
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            payment_status: {
                type: Sequelize.ENUM('Chưa thanh toán', 'Đã thanh toán'),
                defaultValue: 'Chưa thanh toán',
            },
            payment_method: {
                type: Sequelize.ENUM('Tiền mặt', 'ZALOPAY'),
                defaultValue: 'Tiền mặt',
            },
            create_at: {
                type: Sequelize.STRING,
                allowNull: true,
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