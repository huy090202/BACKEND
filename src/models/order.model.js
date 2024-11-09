'use strict';

const { Model } = require('sequelize');
const { DELIVERY_METHOD_CODE, ORDER_STATUS_CODE } = require('../utils/order');
const { PAYMENT_METHOD_CODE, PAYMENT_STATUS_CODE } = require('../utils/payment');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            // 1 đơn hàng thuộc về 1 người dùng
            Order.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });

            // 1 đơn hàng có nhiều chi tiết đơn hàng
            Order.hasMany(models.OrderDetail, {
                foreignKey: 'order_id',
                as: 'orderDetails'
            });
        }
    }

    Order.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        order_code: {
            type: DataTypes.STRING(6),
            allowNull: false,
            unique: true
        },
        total_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        order_date: {
            type: DataTypes.STRING,
            allowNull: true
        },
        order_status: {
            type: DataTypes.ENUM(...Object.values(ORDER_STATUS_CODE)),
            allowNull: false,
            defaultValue: ORDER_STATUS_CODE['PENDING']
        },
        payment_status: {
            type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS_CODE)),
            defaultValue: PAYMENT_STATUS_CODE['UNPAID']
        },
        payment_method: {
            type: DataTypes.ENUM(...Object.keys(PAYMENT_METHOD_CODE)),
            defaultValue: PAYMENT_METHOD_CODE['COD']
        },
        delivery_method: {
            type: DataTypes.ENUM(...Object.keys(DELIVERY_METHOD_CODE)),
            defaultValue: DELIVERY_METHOD_CODE['CARRYOUT']
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Order',
        tableName: 'orders'
    });

    return Order;
};