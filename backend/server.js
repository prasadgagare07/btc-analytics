const marketState =
require("./data/marketState");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { connectBinance } = require("./websocket/binanceSocket");
const { updateCandle, getCandles } = require("./engine/candleEngine");
const { aggregate } = require("./engine/timeframeEngine");
const { calculateEMA } = require("./engine/indicatorEngine");
const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// API Health Check
app.get("/api/status", (req, res) => {
    res.json({
        status: "Running",
        service: "BTC Analytics",
        time: new Date()
    });
});

app.get("/api/market",(req,res)=>{

res.json(marketState);

});

app.get("/api/candles", (req, res) => {
    res.json(getCandles());
});
app.get("/api/timeframes", (req, res) => {

    const candles = getCandles().history["1m"];

    res.json({
        "1m": candles,
        "3m": aggregate(candles, 3),
        "5m": aggregate(candles, 5),
        "10m": aggregate(candles, 10)
    });

});
// Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

connectBinance();

setInterval(() => {
    updateCandle(marketState);
}, 1000);

app.listen(PORT, () => {
    console.log("==================================");
    console.log("BTC Analytics Server Started");
    console.log("Port:", PORT);
    console.log("==================================");
});
