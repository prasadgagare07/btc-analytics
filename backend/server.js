const marketState = require("./data/marketState");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const db = require("./database/db");

const { loadCandles } = require("./database/candleRepository");
const { connectBinance } = require("./websocket/binanceSocket");
//const { updateCandle, getCandles } = require("./engine/candleEngine");
const { updateCandle, getCandles, loadHistory } = require("./engine/candleEngine");
const { aggregate } = require("./engine/timeframeEngine");
const { calculateEMA, calculateRSI } = require("./engine/indicatorEngine");

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

app.get("/api/market", (req, res) => {
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

app.get("/api/indicators", (req, res) => {

    const candles = getCandles().history["1m"];

    res.json({
        ema9: calculateEMA(candles, 9),
        ema21: calculateEMA(candles, 21),
        rsi: calculateRSI(candles)
    });

});

app.get("/api/dbcount", async (req, res) => {

    try {

        const result = await db.query(
            "SELECT COUNT(*) AS total FROM candles"
        );

        res.json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

app.get("/api/export", async (req, res) => {

    try {

        const result = await db.query(
            "SELECT * FROM candles ORDER BY time ASC"
        );

        fs.writeFileSync(
            "candles.json",
            JSON.stringify(result.rows, null, 2)
        );

        res.download("candles.json");

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

// Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

async function initDatabase() {

    try {

        await db.query(`
            CREATE TABLE IF NOT EXISTS candles (
                id SERIAL PRIMARY KEY,
                time BIGINT,
                open DOUBLE PRECISION,
                high DOUBLE PRECISION,
                low DOUBLE PRECISION,
                close DOUBLE PRECISION,
                buy_volume DOUBLE PRECISION,
                sell_volume DOUBLE PRECISION,
                delta DOUBLE PRECISION,
                cvd DOUBLE PRECISION,
                trades INTEGER
            );
        `);

        console.log("Database Ready");

    } catch (err) {

        console.error(err);

    }

}

async function startServer() {

    await initDatabase();

    const history = await loadCandles();

    loadHistory(history);

    console.log("Loaded candles:", history.length);

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

}

startServer();
