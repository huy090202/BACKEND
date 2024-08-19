const { Router } = require('express');
const router = Router();

const userController = require('../controllers/user.controller');
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post("/create", userController.createUserHandler);
router.post("/login", userController.loginUserHandler);

router.put("/update", deserializeUser, userController.updateUserHandler);
router.patch("/change-password", deserializeUser, userController.changePasswordHandler);
router.get("/profile", deserializeUser, userController.getUserProfileHandler);

router.post("/create-staff", [deserializeUser, restrictTo(["ADMIN"])], userController.createStaffHandler);
router.patch("/update-status/:id", [deserializeUser, restrictTo(["ADMIN"])], userController.updateUserStatusHandler);
router.get("/all", [deserializeUser, restrictTo(["ADMIN"])], userController.getAllUsersHandler);
router.get("/all-staff", [deserializeUser, restrictTo(["ADMIN"])], userController.getAllStaffsHandler);
router.get("/all-admin", [deserializeUser, restrictTo(["ADMIN"])], userController.getAllAdminsHandler);

module.exports = router;