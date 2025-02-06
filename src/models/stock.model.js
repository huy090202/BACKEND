'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Stock extends Model {
        static associate(models) {
            // 1 số lượng linh kiện xe máy thuộc về 1 kho
            Stock.belongsTo(models.Warehouse, {
                foreignKey: 'warehouse_id',
                as: 'warehouse',
            });

            // 1 số lượng linh kiện xe máy thuộc về 1 linh kiện xe máy
            Stock.belongsTo(models.MotorcycleParts, {
                foreignKey: 'part_id',
                as: 'part',
            });
        }
    };

    Stock.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        warehouse_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        part_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Stock',
        tableName: 'Stocks',
    });

    return Stock;
}