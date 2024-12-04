const express = require('express');
const { json, urlencoded } = require('body-parser');
const cookieParser = require('cookie-parser');
const { config } = require('dotenv');
const cors = require('cors');
const routes = require('./routers');
const connecttion = require('./configs/database');
const { createBullBoard } = require('bull-board');
const { BullAdapter } = require('bull-board/bullAdapter');
const { orderQueue, appointmentQueue } = require('./utils/queues');

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cài đặt CORS thủ công
// app.use(function (req, res, next) {
//     res.setHeader("Access-Control-Allow-Origin", process.env.URL_REACT);
//     res.setHeader(
//         "Access-Control-Allow-Methods",
//         "GET,POST,PUT,DELETE,OPTIONS,PATCH"
//     );
//     res.setHeader(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);
//     next();
// });

// Cài đặt CORS sử dụng thư viện
const corsOptions = {
    origin: process.env.URL_REACT,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    optionSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(json({ limit: "50mb" }));
app.use(urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.json());

const { router } = createBullBoard([
    new BullAdapter(orderQueue),
    new BullAdapter(appointmentQueue),
]);

app.use('/admin/queues', router);

// Cài đặt các route
routes(app);

// Kết nối đến cơ sở dữ liệu và chạy server
connecttion();

app.listen(PORT, () => {
    console.log("Server đang được chạy ở cổng: ", PORT);
});