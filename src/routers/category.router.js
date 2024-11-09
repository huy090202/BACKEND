const { Router } = require('express');
const router = Router();

const categoryController = require("../controllers/category.controller");
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post("/create", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], categoryController.createCategoryHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], categoryController.updateCategoryByIdHandler);
router.patch("/change-status/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], categoryController.changeCategoryStatusHandler);
router.delete("/delete/:id", [deserializeUser, restrictTo(["Quản trị viên"])], categoryController.deleteCategoryByIdHandler);
router.get("/get/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], categoryController.getCategoryByIdHandler);
router.get("/get-all", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], categoryController.getAllCategoriesHandler);

// Public
router.get("/get", categoryController.getCategoriesHandler)

module.exports = router;