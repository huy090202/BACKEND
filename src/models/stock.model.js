'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Stock extends Model {
        static associate(models) {
            // A stock belongs to a warehouse
            Stock.belongsTo(models.Warehouse, {
                foreignKey: 'warehouse_id',
                as: 'warehouse',
            });

            // A stock belongs to a motorcycle part
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