const {parentPort} = require('worker_threads');
const readline = require('linebyline');

const readTradeData = function (filename) {
    console.log(filename);
    const rl = readline(filename);
    rl.on('line', (line)=> {
        // console.log('got the line')
        try {
             const trade = JSON.parse(line);
             onTrade(trade);
        } catch (e) {
            console.log('Unable to parse line as trade json', e);
        }
    });
    rl.on('error', (err)=>{
        console.log('something went wrong', err);
    })
}

const onTrade = (trade) => {
    parentPort.postMessage(JSON.stringify({
        event: 'readTradeLine',
        data: trade
    }));
}

parentPort.on('message', (message) => {
    const eventData = JSON.parse(message);
    if(eventData.event === 'readTradeData') {
        console.log('received readTradeDataEvent')
        readTradeData(eventData.data);
    }
})
