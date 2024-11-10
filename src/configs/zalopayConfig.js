const { config } = require('dotenv');

config();

const zalopayConfig = {
    app_id: process.env.APP_ID,
    key1: process.env.KEY_1,
    key2: process.env.KEY_2,
    endpoint: process.env.CREATE_ZLP_ENDPOINT,
};

module.exports = zalopayConfig;