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
router.post("/refresh-token", deserializeUser, userController.refreshTokenHandler);

router.post("/create-staff", [deserializeUser, restrictTo(["ADMIN"])], userController.createStaffHandler);
router.patch("/update-status/:id", [deserializeUser, restrictTo(["ADMIN"])], userController.updateUserStatusHandler);

router.get("/all", [deserializeUser, restrictTo(["STAFF", "TECH", "CASHIER", "ADMIN"])], userController.getAllUsersHandler);
router.get("/all-staff", [deserializeUser, restrictTo(["ADMIN"])], userController.getAllStaffsHandler);
router.get("/all-tech", [deserializeUser, restrictTo(["ADMIN"])], userController.getAllTechsHandler);
router.get("/all-cashier", [deserializeUser, restrictTo(["ADMIN"])], userController.getAllCashiersHandler);
router.get("/all-admin", [deserializeUser, restrictTo(["ADMIN"])], userController.getAllAdminsHandler);

module.exports = router;