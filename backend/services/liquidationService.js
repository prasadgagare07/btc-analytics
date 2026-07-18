const WebSocket = require("ws");
const { updateLiquidation } = require("../engine/liquidationEngine");
const marketState = require("../data/marketState");

let ws;

function startLiquidation() {

    ws = new WebSocket(
        "wss://fstream.binance.com/ws/btcusdt@forceOrder"
    );

    ws.on("message", msg => {

        try {

            const data = JSON.parse(msg);

            if (!data.o) return;

            updateLiquidation(
                data.o.S,
                data.o.q,
                data.o.p
            );

            marketState.lastLiquidation = {
                side: data.o.S,
                quantity: Number(data.o.q),
                price: Number(data.o.p)
            };

        } catch (err) {

            console.log("Liquidation Error:", err.message);

        }

    });

    ws.on("close", () => {
        setTimeout(startLiquidation, 5000);
    });

}

module.exports = {
    startLiquidation
};
