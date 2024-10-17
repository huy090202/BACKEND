const { Router } = require('express');
const router = Router();

const manufacturerController = require("../controllers/manufacturer.controller");
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post("/create", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], manufacturerController.createManufacturerHandler);
router.put("/update/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], manufacturerController.updateManufacturerByIdHandler);
router.patch("/change-status/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], manufacturerController.changeManufacturerStatusHandler);
router.delete("/delete/:id", [deserializeUser, restrictTo(["ADMIN"])], manufacturerController.deleteManufacturerByIdHandler);
router.get("/get/:id", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], manufacturerController.getManufacturerByIdHandler);
router.get("/get-all", [deserializeUser, restrictTo(["ADMIN", "STAFF"])], manufacturerController.getAllManufacturersHandler);

// Public
router.get("/all", manufacturerController.getManufacturersHandler);

module.exports = router;