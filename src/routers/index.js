const userRouter = require("./user.router");
const categoryRouter = require("./category.router");
const motorRouter = require("./motor.router");
const motorImageRouter = require("./motorImage.router")
const appointmentRouter = require("./appointment.router");
const appointmentImageRouter = require("./appointmentImage.router");
const manufacturerRouter = require("./manufacturer.router");
const motorcyclepartsRouter = require("./motorcycleparts.router");

const routes = (app) => {
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/category", categoryRouter);
    app.use("/api/v1/motor", motorRouter);
    app.use("/api/v1/motor-image", motorImageRouter);
    app.use("/api/v1/appointment", appointmentRouter);
    app.use("/api/v1/appointment-image", appointmentImageRouter);
    app.use("/api/v1/manufacturer", manufacturerRouter);
    app.use("/api/v1/part", motorcyclepartsRouter);
};

module.exports = routes;