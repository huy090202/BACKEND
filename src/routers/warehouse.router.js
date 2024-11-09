const { Router } = require('express');
const router = Router();

const warehouseController = require('../controllers/warehouse.controller');
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post("/create", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], warehouseController.createWarehouseHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], warehouseController.updateWarehouseByIdHandler);
router.patch("/change-status/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], warehouseController.changeWarehouseStatusHandler);
router.delete("/delete/:id", [deserializeUser, restrictTo(["Quản trị viên"])], warehouseController.deleteWarehouseByIdHandler);
router.get("/get/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], warehouseController.getWarehouseByIdHandler);
router.get("/get-all", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], warehouseController.getAllWarehousesHandler);

// Public
router.get("/get", warehouseController.getWarehousesHandler)

module.exports = router;