const marketState = require("./data/marketState");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const db = require("./database/db");

const { loadCandles } = require("./database/candleRepository");
const { connectBinance } = require("./websocket/binanceSocket");
const { updateCandle, getCandles, loadHistory } = require("./engine/candleEngine");
const { aggregate } = require("./engine/timeframeEngine");
const { calculateEMA, calculateRSI } = require("./engine/indicatorEngine");
const { startOpenInterest } = require("./services/openInterestService");
const { startFundingRate } = require("./services/fundingRateService");
const { startLiquidation } = require("./services/liquidationService");
const { getLiquidation } = require("./engine/liquidationEngine");
/*const {
    addPrediction,
    checkLastPrediction,
    getAccuracy
} = require("./engine/accuracyEngine");*/

const {
    addPrediction: addAccuracyPrediction,
    checkPrediction,
    getAccuracy
} = require("./engine/accuracyEngine");

//const { getAccuracy } = require("./engine/accuracyEngine");
const { getFundingRate } = require("./engine/fundingRateEngine");
const { predict } = require("./engine/predictionEngine");
const { detectPattern } = require("./engine/patternEngine");
const { analyzeOrderBook } = require("./engine/orderBookEngine");
const { detectLevels } = require("./engine/supportResistanceEngine");
const { getOpenInterest } = require("./engine/openInterestEngine");
//const { addPrediction, getHistory } = require("./data/predictionHistory");
const { addPrediction, getHistory, getStats } = require("./data/predictionHistory");
console.log("PredictionHistory module loaded");

const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// API Health
app.get("/api/status", (req, res) => {
    res.json({
        status: "Running",
        service: "BTC Analytics",
        time: new Date()
    });
});

// Live Market
app.get("/api/market", (req, res) => {
    res.json(marketState);
});
app.get("/api/orderbook", (req, res) => {

    res.json(
        analyzeOrderBook(marketState)
    );

});
app.get("/api/levels", (req, res) => {

    const candles = getCandles().history["1m"];

    res.json(
        detectLevels(candles)
    );

});

app.get("/api/open-interest", (req, res) => {

    res.json(
        getOpenInterest()
    );

});

app.get("/api/funding-rate", (req, res) => {

    res.json(
        getFundingRate()
    );

});

app.get("/api/liquidation", (req, res) => {

    res.json(
        getLiquidation()
    );

});

app.get("/api/accuracy", (req, res) => {

    res.json(
        getAccuracy()
    );

});

// Candles
app.get("/api/candles", (req, res) => {
    res.json(getCandles());
});

// Timeframes
app.get("/api/timeframes", (req, res) => {

    const candles = getCandles().history["1m"];

    res.json({
        "1m": candles,
        "3m": aggregate(candles, 3),
        "5m": aggregate(candles, 5),
        "10m": aggregate(candles, 10)
    });

});

// Indicators
app.get("/api/indicators", (req, res) => {

    const candles = getCandles().history["1m"];

    res.json({
        ema9: calculateEMA(candles, 9),
        ema21: calculateEMA(candles, 21),
        rsi: calculateRSI(candles)
    });

});

//predictions

app.get("/api/prediction", async (req, res) => {

    const candles1m = getCandles().history["1m"];
    const candles3m = aggregate(candles1m, 3);
    const candles5m = aggregate(candles1m, 5);
    const candles10m = aggregate(candles1m, 10);

    const indicators = {
        ema9: calculateEMA(candles1m, 9),
        ema21: calculateEMA(candles1m, 21),
        rsi: calculateRSI(candles1m)
    };
    const pattern = detectPattern(candles1m);
console.log("Prediction route called");
    
const prediction = predict(
    {
        candles1m,
        candles3m,
        candles5m,
        candles10m
    },
    indicators,
    marketState,
    pattern
);
    const candles = getCandles().history["1m"];

const lastCandle =
    candles[candles.length - 1];

await db.query(
    `INSERT INTO predictions
    (prediction, price, candle_time)
    VALUES ($1,$2,$3)`,
    [
        prediction.signal,
        marketState.lastPrice,
        lastCandle
            ? lastCandle.time
            : Date.now()
    ]
);

/*addPrediction({
    ...prediction,
    price: marketState.lastPrice,
    time: Date.now()
});*/

    /*addPrediction(
    prediction.signal,
    marketState.lastPrice
);*/

addAccuracyPrediction(
    prediction.signal,
    marketState.lastPrice,
    lastCandle ? lastCandle.time : Date.now()
);

console.log("Prediction saved:", prediction);
console.log("History size:", getHistory().length);

res.json(prediction);
});
app.get("/api/prediction-history", (req, res) => {
    res.json(getHistory());
});
app.get("/api/accuracy", (req, res) => {
    res.json(getStats());
});
// Database Count
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

// Export Candles
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

// Initialize Database
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

        await db.query(`
    CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        prediction VARCHAR(10),
        price DOUBLE PRECISION,
        candle_time BIGINT,
        actual VARCHAR(10),
        correct BOOLEAN
    );
`);

        console.log("Database Ready");

    } catch (err) {

        console.error(err);

    }

}

// Start Server
async function startServer() {

    await initDatabase();

    const history = await loadCandles();

    loadHistory(history);

    console.log("Loaded candles:", history.length);

    connectBinance();
    startOpenInterest();
    startFundingRate();
    startLiquidation();
    /*setInterval(() => {
        updateCandle(marketState);
    },1000);*/

    setInterval(() => {

    updateCandle(marketState);

    const candles = getCandles().history["1m"];

const lastCandle =
    candles[candles.length - 1];

if (lastCandle) {
    checkPrediction(lastCandle);
}

}, 1000);

    app.listen(PORT, () => {
        console.log("==================================");
        console.log("BTC Analytics Server Started");
        console.log("Port:", PORT);
        console.log("==================================");
    });

}

startServer();
