const { Router } = require('express');
const router = Router();

const warehouseController = require('../controllers/warehouse.controller');
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post("/create", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], warehouseController.createWarehouseHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], warehouseController.updateWarehouseByIdHandler);
router.patch("/change-status/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], warehouseController.changeWarehouseStatusHandler);
router.delete("/delete/:id", [deserializeUser, restrictTo(["ADMIN"])], warehouseController.deleteWarehouseByIdHandler);
router.get("/get/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], warehouseController.getWarehouseByIdHandler);
router.get("/get-all", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], warehouseController.getAllWarehousesHandler);

// Public
router.get("/get", warehouseController.getWarehousesHandler)

module.exports = router;