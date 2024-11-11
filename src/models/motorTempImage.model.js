'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MotorTempImage extends Model {
        static associate(models) {
            // 1 hình ảnh xe máy thuộc về 1 chiếc xe máy tạm
            MotorTempImage.belongsTo(models.MotorTemp, {
                foreignKey: 'motorTemp_id',
                as: 'motorTemp',
            });
        }
    };

    MotorTempImage.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        motorTemp_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'MotorTempImage',
        tableName: 'MotorTempImages',
    });

    return MotorTempImage;
}