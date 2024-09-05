const userRouter = require("./user.router");
const categoryRouter = require("./category.router");

const routes = (app) => {
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/category", categoryRouter);
};

module.exports = routes;