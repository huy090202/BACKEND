const categoryService = require("../services/category.service");

// Tạo một danh mục mới
const createCategoryHandler = async (req, res) => {
    const { name, description, active } = req.body;
    if (!name) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        })
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Trạng thái phải là true hoặc false",
        })
    }

    const existedCategory = await categoryService.findCategoryByName(name);
    if (existedCategory) {
        return res.status(400).json({
            status: false,
            message: "Danh mục đã tồn tại",
            data: {}
        })
    }

    const category = await categoryService.createCategory(req.body);
    if (!category) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi tạo danh mục",
            data: {}
        })
    }

    return res.status(201).json({
        status: true,
        message: "Danh mục đã được tạo thành công",
        data: category
    })
};

// Cập nhật danh mục theo id
const updateCategoryByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id danh mục không được để trống",
            data: {}
        })
    }

    const { name, description, active } = req.body;
    if (!name) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        })
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Trạng thái phải là true hoặc false",
        })
    }

    const existedCategory = await categoryService.findCategoryById(id);
    if (!existedCategory) {
        return res.status(404).json({
            status: false,
            message: `Danh mục '${id}' không tồn tại`,
        })
    }

    const category = await categoryService.updateCategoryById(id, req.body);
    return res.status(200).json({
        status: true,
        message: "Danh mục đã được cập nhật thành công",
        data: category
    })
};

// Thay đổi trạng thái danh mục
const changeCategoryStatusHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id danh mục không được để trống",
            data: {}
        })
    }

    const existedCategory = await categoryService.findCategoryById(id);
    if (!existedCategory) {
        return res.status(404).json({
            status: false,
            message: `Danh mục '${id}' không tồn tại`,
            data: {}
        })
    }

    const { active } = req.body;
    let activeVar = true;
    if (active === 'false' || active === false) activeVar = false;
    await categoryService.updateCategory(id, activeVar);

    return res.status(200).json({
        status: true,
        message: activeVar ? "Danh mục đã được kích hoạt" : "Danh mục đã được vô hiệu hóa",
        data: {}
    })
};

// Xoá danh mục theo id
const deleteCategoryByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id danh mục không được để trống",
            data: {}
        })
    }

    const category = await categoryService.deleteCategoryById(id);
    if (!category) {
        return res.status(404).json({
            status: false,
            message: `Danh mục '${id}' không tồn tại`,
            data: {}
        })
    }

    return res.status(200).json({
        status: true,
        message: "Danh mục đã được xoá thành công",
        data: {}
    })

};

// Lấy thông tin danh mục theo id
const getCategoryByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id danh mục không được để trống",
            data: {}
        })
    }

    const category = await categoryService.findCategoryById(id);
    if (!category) {
        return res.status(404).json({
            status: false,
            message: `Danh mục '${id}' không tồn tại`,
        })
    }

    return res.status(200).json({
        status: true,
        message: "Lấy thông tin danh mục thành công",
        data: category
    })
};

// Admin - Lấy tất cả danh mục
const getAllCategoriesHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let categories = [];
    if (active === 'true' || active === true)
        categories = await categoryService.findCategories({ status: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        categories = await categoryService.findCategories({ status: { active: false }, offset, limit: parseInt(limit) });
    else categories = await categoryService.findCategories({ status: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "Lấy danh sách danh mục thành công",
        data: categories.rows,
        total: categories.count,
        page: parseInt(page),
        limit: parseInt(limit)
    })
};

// Public - Lấy tất cả danh mục có trạng thái active
const getCategoriesHandler = async (req, res) => {
    let categories = [];
    categories = await categoryService.findCategories({ status: { active: true } });
    return res.status(200).json({
        status: true,
        message: "Lấy danh sách danh mục thành công",
        data: categories.rows,
        total: categories.count,
    })
};

module.exports = {
    createCategoryHandler,
    updateCategoryByIdHandler,
    changeCategoryStatusHandler,
    deleteCategoryByIdHandler,
    getCategoryByIdHandler,
    getAllCategoriesHandler,
    getCategoriesHandler
}