'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Warehouse extends Model {
        static associate(models) {
            // 1 kho có nhiều số lượng linh kiện xe máy
            Warehouse.hasMany(models.Stock, {
                foreignKey: 'warehouse_id',
                as: 'stocks',
            });
        }
    };

    Warehouse.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    }, {
        sequelize,
        modelName: 'Warehouse',
        tableName: 'Warehouses',
    });

    return Warehouse;
}