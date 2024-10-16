const { Router } = require('express');
const router = Router();

const appointmentImageController = require('../controllers/appointmentImage.controller');
const deserializeUser = require('../middleware/deserializeUser');
const { upload } = require('../middleware/uploadImages');

router.post("/create", deserializeUser, upload.array("image_url"), appointmentImageController.createAppointmentImageHandler);
router.put("/update/:id", deserializeUser, upload.single("image_url"), appointmentImageController.updateAppointmentImageByIdHandler);
router.delete("/delete/:id", deserializeUser, appointmentImageController.deleteAppointmentImageByIdHandler);
router.get("/get/:id", deserializeUser, appointmentImageController.getAppointmentImageByIdHandler);
router.get("/all", deserializeUser, appointmentImageController.getAllAppointmentImagesHandler);

module.exports = router;