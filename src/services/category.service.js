const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một danh mục mới
const createCategory = async (data) => {
    const category = await db.Category.create(data);
    return omit(category.toJSON(), ['createdAt', 'updatedAt']);
};

// Tìm một danh mục theo tên
const findCategoryByName = async (name) => {
    const category = await db.Category.findOne({ where: { name } });
    return category;
};

// Tìm tất cả danh mục
const findCategories = async ({ status, offset, limit }) => {
    const categories = await db.Category.findAndCountAll({
        where: status,
        offset,
        limit
    });
    return categories;
};

// Cập nhật trạng thái danh mục
const updateCategory = async (id, status) => {
    return await db.Category.update({ active: status }, { where: { id } });
};

// Tìm một danh mục theo id
const findCategoryById = async (id) => {
    const category = await db.Category.findByPk(id)
    return category;
};

// Xóa danh mục theo id
const deleteCategoryById = async (id) => {
    return await db.Category.destroy({ where: { id } });
};

// Cập nhật danh mục theo id
const updateCategoryById = async (id, data) => {
    try {
        const category = await findCategoryById(id);
        if (!category) return null;

        await category.update(data);
        return category;
    } catch (e) {
        console.error('Lỗi trong việc cập nhật danh mục:', e);
        throw new Error('Có lỗi xảy ra khi cập nhật danh mục');
    }
};

module.exports = {
    createCategory,
    findCategoryByName,
    findCategories,
    updateCategory,
    findCategoryById,
    deleteCategoryById,
    updateCategoryById
}