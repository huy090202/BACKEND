const userRouter = require("./user.router");
const categoryRouter = require("./category.router");
const motorRouter = require("./motor.router");
const motorImageRouter = require("./motorImage.router")

const routes = (app) => {
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/category", categoryRouter);
    app.use("/api/v1/motor", motorRouter);
    app.use("/api/v1/motor-image", motorImageRouter);
};

module.exports = routes;