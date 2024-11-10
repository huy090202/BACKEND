const { Router } = require('express');
const router = Router();

const manufacturerController = require("../controllers/manufacturer.controller");
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post("/create", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], manufacturerController.createManufacturerHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], manufacturerController.updateManufacturerByIdHandler);
router.patch("/change-status/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], manufacturerController.changeManufacturerStatusHandler);
router.delete("/delete/:id", [deserializeUser, restrictTo(["Quản trị viên"])], manufacturerController.deleteManufacturerByIdHandler);
router.get("/get/:id", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], manufacturerController.getManufacturerByIdHandler);
router.get("/get-all", [deserializeUser, restrictTo(["Quản trị viên", "Nhân viên"])], manufacturerController.getAllManufacturersHandler);

// Public
router.get("/all", manufacturerController.getManufacturersHandler);

module.exports = router;