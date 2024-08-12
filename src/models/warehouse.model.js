'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Warehouse extends Model {
        static associate(models) {
            // A warehouse has many stocks
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
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('name', value.trim());
            },
            get() {
                const rawValue = this.getDataValue('name');
                return rawValue ? rawValue.trim() : null;
            }
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