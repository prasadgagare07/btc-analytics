const { processTrade } =
require("../services/tradeCollector");

const WebSocket = require("ws");

let ws = null;

function connectBinance() {
    console.log("Connecting to Binance...");

    ws = new WebSocket(
        "wss://stream.binance.com:9443/ws/btcusdt@trade"
    );

    ws.on("open", () => {
        console.log("Connected to Binance WebSocket");
    });

    ws.on("message",(message)=>{

const trade=JSON.parse(message);

processTrade(trade);

});

    ws.on("close", () => {
        console.log("Binance disconnected. Reconnecting in 5 seconds...");
        setTimeout(connectBinance, 5000);
    });

    ws.on("error", (err) => {
        console.log("WebSocket Error:", err.message);
        ws.close();
    });
}

module.exports = {
    connectBinance
};
