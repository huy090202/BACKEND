'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PartImage extends Model {
        static associate(models) {
            // 1 hình ảnh linh kiện xe máy thuộc về 1 linh kiện xe máy
            PartImage.belongsTo(models.MotorcycleParts, {
                foreignKey: 'part_id',
                as: 'part',
            });
        }
    };

    PartImage.init({
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
        part_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'PartImage',
        tableName: 'PartImages',
    });

    return PartImage;
}