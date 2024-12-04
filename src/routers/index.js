const userRouter = require("./user.router");
const categoryRouter = require("./category.router");
const motorRouter = require("./motor.router");
const motorImageRouter = require("./motorImage.router")
const appointmentRouter = require("./appointment.router");
const appointmentImageRouter = require("./appointmentImage.router");
const manufacturerRouter = require("./manufacturer.router");
const motorcyclepartsRouter = require("./motorcycleparts.router");
const warehouseRouter = require("./warehouse.router");
const maintenanceRouter = require("./maintenance.router");
const maintenanceDetailRouter = require("./maintenanceDetail.router");
const orderRouter = require("./order.router");
const motorTempRouter = require("./motorTemp.router");
const invoiceRouter = require("./invoice.router");

const routes = (app) => {
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/category", categoryRouter);
    app.use("/api/v1/motor", motorRouter);
    app.use("/api/v1/motor-image", motorImageRouter);
    app.use("/api/v1/appointment", appointmentRouter);
    app.use("/api/v1/appointment-image", appointmentImageRouter);
    app.use("/api/v1/manufacturer", manufacturerRouter);
    app.use("/api/v1/part", motorcyclepartsRouter);
    app.use("/api/v1/warehouse", warehouseRouter);
    app.use("/api/v1/maintenance", maintenanceRouter);
    app.use("/api/v1/maintenance-detail", maintenanceDetailRouter);
    app.use("/api/v1/order", orderRouter);
    app.use("/api/v1/motorTemp", motorTempRouter);
    app.use("/api/v1/invoice", invoiceRouter);
};

module.exports = routes;