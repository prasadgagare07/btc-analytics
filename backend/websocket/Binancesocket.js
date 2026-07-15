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

    ws.on("message", (message) => {
        const trade = JSON.parse(message);

        console.log(
            `Price: ${trade.p} | Qty: ${trade.q} | BuyerMaker: ${trade.m}`
        );
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
