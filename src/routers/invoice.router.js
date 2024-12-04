const { Router } = require('express');
const router = Router();

const invoiceController = require('../controllers/invoice.controller');
const deserializeUser = require('../middleware/deserializeUser');
const restrictTo = require('../middleware/restrictTo');

router.post('/create', deserializeUser, invoiceController.createInvoiceHandler);
router.post('/callback', invoiceController.callbackInvoiceHandler);
router.get('/check/:app_trans_id', invoiceController.checkStatusPaymentHandler);
router.delete('/delete/:code', [deserializeUser, restrictTo(["Nhân viên", "Thu ngân", "Quản trị viên"])], invoiceController.deleteInvoiceHandler);
router.get("/all", [deserializeUser, restrictTo(["Nhân viên", "Thu ngân", "Quản trị viên"])], invoiceController.allInvoicesHandler);

module.exports = router;