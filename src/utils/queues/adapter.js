const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { orderQueue } = require('./index');

const serverAdapter = new ExpressAdapter();

createBullBoard({
    queues: [new BullAdapter(orderQueue)],
    serverAdapter,
});

module.exports = serverAdapter;