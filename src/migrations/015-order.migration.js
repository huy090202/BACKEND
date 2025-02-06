'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('Orders', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: false
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            order_code: {
                type: Sequelize.STRING(6),
                allowNull: false,
                unique: true
            },
            total_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            order_date: {
                type: Sequelize.STRING,
                allowNull: true
            },
            order_status: {
                type: Sequelize.ENUM('Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy', 'Đơn hàng không hợp lệ', 'Đơn hàng thất bại'),
                defaultValue: 'Chờ xác nhận'
            },
            payment_status: {
                type: Sequelize.ENUM('Đã thanh toán', 'Chưa thanh toán'),
                defaultValue: 'Chưa thanh toán'
            },
            payment_method: {
                type: Sequelize.ENUM('Tiền mặt', 'ZALOPAY'),
                defaultValue: 'Tiền mặt'
            },
            delivery_method: {
                type: Sequelize.ENUM('Giao hàng', 'Nhận tại cửa hàng'),
                defaultValue: 'Nhận tại cửa hàng'
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
        })
    },
    down: async (queryInterface, Sequelize) => {
        return await queryInterface.dropTable('Orders');
    },
}