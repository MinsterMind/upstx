# upstx
Steps to start the OHLC server
```
npm install
node index.js
```

Run OHLC client using terminal
e.g.
```
wscat -c ws://localhost:8888
> {"event": "subscribe", "symbol": "XXBTZUSD", "interval": 15}
```
