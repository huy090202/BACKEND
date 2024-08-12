'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class OrderDetail extends Model {
        static associate(models) {
            // An order detail belongs to an order
            OrderDetail.belongsTo(models.Order, {
                foreignKey: 'order_id',
                as: 'order',
            });

            // An order detail belongs to a motorcycle parts
            OrderDetail.belongsTo(models.MotorcycleParts, {
                foreignKey: 'part_id',
                as: 'part',
            });
        }
    };

    OrderDetail.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
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
        }
    }, {
        sequelize,
        modelName: 'OrderDetail',
        tableName: 'OrderDetails',
    });

    return OrderDetail;
}