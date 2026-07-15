const { processTrade } =
require("../services/tradeCollector");
const { processBookTicker } = require("../services/orderBookCollector");
const WebSocket = require("ws");

let ws = null;

function connectBinance() {
    console.log("Connecting to Binance...");

    ws = new WebSocket(
        "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/btcusdt@bookTicker"
    );

    

    ws.on("open", () => {
        console.log("Connected to Binance WebSocket");
    });

    ws.on("message", (message) => {

    const msg = JSON.parse(message);

    if (!msg.stream) return;

    if (msg.stream.includes("@trade")) {
        processTrade(msg.data);
    }

    if (msg.stream.includes("@bookTicker")) {
        processBookTicker(msg.data);
    }

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
