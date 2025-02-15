'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MotorImage extends Model {
        static associate(models) {
            // 1 hình ảnh xe máy thuộc về 1 chiếc xe máy
            MotorImage.belongsTo(models.Motor, {
                foreignKey: 'motor_id',
                as: 'motor',
            });
        }
    };

    MotorImage.init({
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
        motor_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'MotorImage',
        tableName: 'MotorImages',
    });

    return MotorImage;
}