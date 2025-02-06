const { createBullBoard } = require('bull-board');
const { BullAdapter } = require('bull-board/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { orderQueue, appointmentQueue } = require('./index');

const serverAdapter = new ExpressAdapter();

createBullBoard({
    queues: [
        new BullAdapter(orderQueue),
        new BullAdapter(appointmentQueue),
    ],
    serverAdapter,
});

module.exports = serverAdapter;