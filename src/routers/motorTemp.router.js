const { Router } = require('express');
const router = Router();

const motorTempController = require("../controllers/motortemp.controller");

router.post("/create", motorTempController.createMotorTempHandler);
router.put("/update/:id", motorTempController.updateMotorTempByIdHandler);
router.delete("/delete/:id", motorTempController.deleteMotorTempByIdHandler);
router.get("/get/:id", motorTempController.getMotorTempByIdHandler);
router.get("/all", motorTempController.getAllMotorTempsHandler);

module.exports = router;