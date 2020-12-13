const {parentPort} = require('worker_threads');
const WebSocket = require('ws');

const subscriptions = {}

const createSubscription = (subscribeEvent, subscriber) => {
    if(!subscriptions[subscribeEvent.symbol]) {
        subscriptions[subscribeEvent.symbol] = [];
    }
    subscriptions[subscribeEvent.symbol].push(subscriber);
    parentPort.postMessage(
        JSON.stringify({
            event: 'subscription',
            data: subscribeEvent.symbol
        })
    );
}

const processEvent = (eventMessage, sender) => {
    try {
        const event = JSON.parse(eventMessage);
        if (event.event === 'subscribe') {
            createSubscription(event, sender);
        } else {
            sender.send(`currently supported events ['subscribe']`);
        }
    } catch (e) {
        sender.send('Could not recognize the event')
    }
}

const removeSubscription = (subscriber) => {
    for (let symbol in subscriptions) {
        subscriptions[symbol] = subscriptions[symbol].filter(s => s !== subscriber);
    }
}

const initializeSocket = (socket) => {

    socket.on('message', (msg)=> {
        processEvent(msg, socket);
    });

    socket.on('close', ()=> {
        removeSubscription(socket);
    });
}

const sendOhlcNotification = (notification) => {
    if(subscriptions[notification.symbol]) {
        subscriptions[notification.symbol].forEach(s => s.send(JSON.stringify(notification)));
    }
}

parentPort.on('message', (message) => {
    const eventData = JSON.parse(message);
    if(eventData.event === 'notification') {
        sendOhlcNotification(eventData.data);
    }
})

const server = new WebSocket.Server({port: 8888});
server.on('connection', initializeSocket);

// class WebsocketThread {
//     constructor() {
//         this.subscriptions = {};
//         this.startServer = this.startServer.bind(this);
//         this.initializeSocket = this.initializeSocket.bind(this);
//         this.processEvent = this.processEvent.bind(this);
//         this.createSubscription = this.createSubscription.bind(this);
//         this.removeSubscription = this.removeSubscription.bind(this);
//     }
//
//     addSubscriptionHandler(onsubscription) {
//         this.onSubscription = onsubscription;
//     }
//
//     startServer(port) {
//         const server = new WebSocket.Server({port: port || 8888});
//         server.on('connection', this.initializeSocket);
//     }
//
//     async initializeSocket(socket) {
//
//         socket.on('message', (msg)=> {
//             this.processEvent(msg, socket);
//         });
//
//         socket.on('close', ()=> {
//             this.removeSubscription(socket);
//         });
//     }
//
//     processEvent(eventMessage, sender) {
//         try {
//             const event = JSON.parse(eventMessage);
//             if (event.event === 'subscribe') {
//                 this.createSubscription(event, sender);
//             } else {
//                 sender.send(`currently supported events ['subscribe']`);
//             }
//         } catch (e) {
//             sender.send('Could not recognize the event')
//         }
//     }
//
//     createSubscription(subscribeEvent, subscriber) {
//         if(!this.subscriptions[subscribeEvent.symbol]) {
//             this.subscriptions[subscribeEvent.symbol] = [];
//         }
//         this.subscriptions[subscribeEvent.symbol].push(subscriber);
//         if(this.onSubscription) {
//             this.onSubscription(subscribeEvent.symbol);
//         }
//     }
//
//     removeSubscription(subscriber) {
//         for (let symbol in this.subscriptions) {
//             this.subscriptions[symbol] = this.subscriptions[symbol].filter(s => s !== subscriber);
//         }
//     }
//
//     sendOhlcNotification(notification) {
//         if(this.subscriptions[notification.symbol]) {
//             this.subscriptions[notification.symbol].forEach(s => s.send(JSON.stringify(notification)));
//         }
//     }
// }
//
//
// const websocketAdapter = new WebsocketThread();
//
// websocketAdapter.startServer(8888).then(()=> {
//     console.log(`server started successfully`);
// });

