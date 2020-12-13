const {parentPort} = require('worker_threads');

const data = {}

const notificationHandler = (notification) => {
    parentPort.postMessage(JSON.stringify({
        event: 'notifyUser',
        data: notification
    }));
}

parentPort.on('message', (message) => {
    const eventData = JSON.parse(message);
    if(eventData.event === 'addTrade') {
        console.log('got addTrade event')
        console.log(eventData.data)
        addTrade(eventData.data);
    }
})

const addTrade = (tradeJson) => {
    if(!data[tradeJson.sym]) {
        data[tradeJson.sym] = [
            {
                o: tradeJson.P,
                h: tradeJson.P,
                l: tradeJson.P,
                c: tradeJson.P,
                volume: tradeJson.Q,
                event: 'ohlc_notify',
                symbol: tradeJson.sym,
                bar_num: 1,
                timestamp: tradeJson.TS2
            }
        ]
    } else {
        let lastBarchart = data[tradeJson.sym] && data[tradeJson.sym][data[tradeJson.sym].length - 1];
        if (!lastBarchart) {
            lastBarchart = {
                o: tradeJson.P,
                h: tradeJson.P,
                l: tradeJson.P,
                c: tradeJson.P,
                volume: tradeJson.Q,
                event: 'ohlc_notify',
                symbol: tradeJson.sym,
                bar_num: 1,
                timestamp: tradeJson.TS2
            }
            data[tradeJson.sym].push(lastBarchart);
        }
        while (lastBarchart.timestamp + 15000000000 < tradeJson.TS2) {
            notificationHandler(lastBarchart);
            lastBarchart = {
                event: 'ohlc_notify',
                symbol:tradeJson.sym,
                bar_num: lastBarchart.bar_num + 1,
                timestamp: lastBarchart.timestamp + 15000000000
            };
            data[tradeJson.sym].push(lastBarchart);
        }
        if(!lastBarchart.o) lastBarchart.o = tradeJson.P;
        if(!lastBarchart.h || lastBarchart.h < tradeJson.P) lastBarchart.h = tradeJson.P;
        if(!lastBarchart.l || lastBarchart.l > tradeJson.P) lastBarchart.l = tradeJson.P;
        lastBarchart.c = tradeJson.P;
        lastBarchart.volume = (lastBarchart.volume || 0) + tradeJson.Q
    }
}

// class FiniteStateMachineAdapter {
//     constructor(notificationHandler) {
//         this.data = {}
//         this.addTrade = this.addTrade.bind(this);
//         this.notificationHandler = notificationHandler;
//     }
//
//     addTrade(tradeJson) {
//         if(!this.data[tradeJson.sym]) {
//             this.data[tradeJson.sym] = [
//                 {
//                     o: tradeJson.P,
//                     h: tradeJson.P,
//                     l: tradeJson.P,
//                     c: tradeJson.P,
//                     volume: tradeJson.Q,
//                     event: 'ohlc_notify',
//                     symbol: tradeJson.sym,
//                     bar_num: 1,
//                     timestamp: tradeJson.TS2
//                 }
//             ]
//         } else {
//             let lastBarchart = this.data[tradeJson.sym] && this.data[tradeJson.sym][this.data[tradeJson.sym].length - 1];
//             if (!lastBarchart) {
//                 lastBarchart = {
//                     o: tradeJson.P,
//                     h: tradeJson.P,
//                     l: tradeJson.P,
//                     c: tradeJson.P,
//                     volume: tradeJson.Q,
//                     event: 'ohlc_notify',
//                     symbol: tradeJson.sym,
//                     bar_num: 1,
//                     timestamp: tradeJson.TS2
//                 }
//                 this.data[tradeJson.sym].push(lastBarchart);
//             }
//             while (lastBarchart.timestamp + 15000000000 < tradeJson.TS2) {
//                 this.notificationHandler(lastBarchart);
//                 lastBarchart = {
//                     event: 'ohlc_notify',
//                     symbol:tradeJson.sym,
//                     bar_num: lastBarchart.bar_num + 1,
//                     timestamp: lastBarchart.timestamp + 15000000000
//                 };
//                 this.data[tradeJson.sym].push(lastBarchart);
//             }
//             if(!lastBarchart.o) lastBarchart.o = tradeJson.P;
//             if(!lastBarchart.h || lastBarchart.h < tradeJson.P) lastBarchart.h = tradeJson.P;
//             if(!lastBarchart.l || lastBarchart.l > tradeJson.P) lastBarchart.l = tradeJson.P;
//             lastBarchart.c = tradeJson.P;
//             lastBarchart.volume = (lastBarchart.volume || 0) + tradeJson.Q
//         }
//     }
// }
//
// module.exports = FiniteStateMachineAdapter