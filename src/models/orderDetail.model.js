'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class OrderDetail extends Model {
        static associate(models) {
            // 1 chi tiết đơn hàng thuộc về 1 đơn hàng
            OrderDetail.belongsTo(models.Order, {
                foreignKey: 'order_id',
                as: 'order'
            });

            // 1 chi tiết đơn hàng thuộc về 1 linh kiện
            OrderDetail.belongsTo(models.MotorcycleParts, {
                foreignKey: 'part_id',
                as: 'part'
            });
        }
    }

    OrderDetail.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        part_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'OrderDetail',
        tableName: 'OrderDetails'
    });
    return OrderDetail;
};