'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Manufacturer extends Model {
        static associate(models) {
            // 1 nhà sản xuất có nhiều linh kiện xe máy
            Manufacturer.hasMany(models.MotorcycleParts, {
                foreignKey: 'manufacturer_id',
                as: 'motorcycleParts',
            });
        }
    };

    Manufacturer.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    }, {
        sequelize,
        modelName: 'Manufacturer',
        tableName: 'Manufacturers',
    });

    return Manufacturer;
}