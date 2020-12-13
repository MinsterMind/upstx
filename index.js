const _ = require('lodash');

const {Worker} = require('worker_threads');

const webSocketWorker = new Worker('./Adapters/WebsocketThreadAdapter.js');
const tradeDataWorker = new Worker('./Adapters/TradeDataThread.js');
const finiteStateMachineWorker = new Worker('./Adapters/FiniteStateMachineAdapter.js');

webSocketWorker.on('message', (message) => {
    const eventData = JSON.parse(message);
    if(eventData.event ===  'subscription') {
        subscriptionHandler(eventData.data);
    }
})

finiteStateMachineWorker.on('message', (message) => {
    const eventData = JSON.parse(message);
    if(eventData.event === 'notifyUser') {
        console.log('got notify user event')
        webSocketWorker.postMessage(JSON.stringify({
            event: 'notification',
            data: _.pick(eventData.data, ['o','h','l','c','volume','event','symbol','bar_num'])
        }))
    }
})

tradeDataWorker.on('message', (message)=>{
    const eventData = JSON.parse(message);
    if(eventData.event === 'readTradeLine') {
        console.log('got the readTradeLine Event')
        finiteStateMachineWorker.postMessage(JSON.stringify({
            event: 'addTrade',
            data: eventData.data
        }));
    }
})

const subscriptionHandler = (symbol) => {
    console.log(`user subscribed for ${symbol}`);
    tradeDataWorker.postMessage(JSON.stringify({
        event: 'readTradeData',
        data: `${__dirname}/testData/trades.json`
    }))
}