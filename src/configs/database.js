const { Sequelize } = require('sequelize');
const { config } = require('dotenv');

config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
});

let connecttion = async () => {
    try {
        await sequelize.authenticate();
        console.log('Kết nối thành công đến cơ sở dữ liệu');
    } catch (error) {
        console.error('Kết nối đến cơ sở dữ liệu thất bại: ', error);
    }
}

module.exports = connecttion;