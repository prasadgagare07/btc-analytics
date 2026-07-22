const marketState = require("./data/marketState");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const db = require("./database/db");

(async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS candle_predictions (
                id SERIAL PRIMARY KEY,
                prediction_time BIGINT,
                expiry_time BIGINT,
                open_price DOUBLE PRECISION,
                close_price DOUBLE PRECISION,
                signal TEXT,
                confidence INT,
                result TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log("✅ candle_predictions table created");
    } catch (err) {
        console.log(err.message);
    }
})();
const {
    runScheduler
} = require("./engine/candleScheduler");
const {
    checkResults
} = require("./engine/resultChecker");
const { loadCandles } = require("./database/candleRepository");
const { connectBinance } = require("./websocket/binanceSocket");
const { updateCandle, getCandles, loadHistory } = require("./engine/candleEngine");
const { aggregate } = require("./engine/timeframeEngine");
const { calculateEMA, calculateRSI } = require("./engine/indicatorEngine");
const { startOpenInterest } = require("./services/openInterestService");
const { startFundingRate } = require("./services/fundingRateService");
const { startLiquidation } = require("./services/liquidationService");
const { getLiquidation } = require("./engine/liquidationEngine");
const {
    addPrediction: addAccuracyPrediction,
    checkPrediction,
    getAccuracy
} = require("./engine/accuracyEngine");
const {
    setPrediction,
    getPrediction,
    checkPrediction: checkCandlePrediction
} = require("./engine/candlePredictionEngine");

const { getFundingRate } = require("./engine/fundingRateEngine");
const { predict } = require("./engine/predictionEngine");
const { detectPattern } = require("./engine/patternEngine");
const { analyzeOrderBook } = require("./engine/orderBookEngine");
const { detectLevels } = require("./engine/supportResistanceEngine");
const { getOpenInterest } = require("./engine/openInterestEngine");
const { addPrediction, getHistory, getStats } = require("./data/predictionHistory");
console.log("PredictionHistory module loaded");

const app = express();

const PORT = process.env.PORT || 10000;
let last5mPredictionTime = 0;

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

app.get("/api/clear-predictions", async (req, res) => {

    await db.query(`
        DELETE FROM candle_predictions
    `);

    res.send("Predictions cleared");

});

app.get("/api/probability", (req, res) => {

    const prediction = predict(
        {
            candles1m: getCandles().history["1m"],
            candles3m: aggregate(getCandles().history["1m"], 3),
            candles5m: aggregate(getCandles().history["1m"], 5),
            candles10m: aggregate(getCandles().history["1m"], 10)
        },
        {
            ema9: calculateEMA(getCandles().history["1m"], 9),
            ema21: calculateEMA(getCandles().history["1m"], 21),
            rsi: calculateRSI(getCandles().history["1m"])
        },
        marketState,
        detectPattern(getCandles().history["1m"])
    );

    let buy = 50;
    let sell = 50;

    if (prediction.signal === "BUY") {
        buy = prediction.confidence;
        sell = 100 - buy;
    }

    if (prediction.signal === "SELL") {
        sell = prediction.confidence;
        buy = 100 - sell;
    }

    res.json({
        buy,
        sell
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

app.get("/api/streaks", async (req, res) => {

    const result = await db.query(`
        SELECT result
        FROM candle_predictions
        ORDER BY prediction_time ASC
    `);

    let currentWin = 0;
    let currentLoss = 0;
    let currentNoTrade = 0;

    let maxWin = 0;
    let maxLoss = 0;
    let maxNoTrade = 0;

    for (const row of result.rows) {

        if (row.result === "WIN") {

            currentWin++;

            currentNoTrade = 0;

            if (currentWin > maxWin)
                maxWin = currentWin;

        }

        else if (row.result === "LOSS") {

            currentLoss++;

            currentNoTrade = 0;

            if (currentLoss > maxLoss)
                maxLoss = currentLoss;

        }

        else if (row.result === "HOLD") {

    currentNoTrade++;

    if (currentNoTrade > maxNoTrade)
    maxNoTrade = currentNoTrade;

}
        // WIN breaks LOSS
        if (row.result === "WIN") {
            currentLoss = 0;
        }

        // LOSS breaks WIN
        if (row.result === "LOSS") {
            currentWin = 0;
        }

    }

    res.json({

        maxWin,

        maxLoss,

        maxNoTrade,

        currentWin,

        currentLoss,

        currentNoTrade

    });

});

app.get("/api/last-trades", async (req, res) => {

    const result = await db.query(`
        SELECT *
        FROM candle_predictions
        WHERE result <> 'PENDING'
        ORDER BY prediction_time DESC
        LIMIT 10
    `);

    res.json(result.rows);

});

app.get("/api/streak", async (req, res) => {

    const result = await db.query(`
        SELECT result
        FROM candle_predictions
        WHERE result IN ('WIN','LOSS')
        ORDER BY prediction_time DESC
    `);

    let streak = 0;
    let type = "-";

    if (result.rows.length > 0) {

        type = result.rows[0].result;

        for (const row of result.rows) {

            if (row.result === type) {
                streak++;
            } else {
                break;
            }

        }

    }

    res.json({
        streak,
        type
    });

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

app.get("/api/accuracy", async (req, res) => {

    try {

        const total = await db.query(
    "SELECT COUNT(*) FROM predictions WHERE correct IS NOT NULL AND signal != 'HOLD'"
);

        const correct = await db.query(
    "SELECT COUNT(*) FROM predictions WHERE correct = true AND signal != 'HOLD'"
);

        const totalCount = Number(total.rows[0].count);
        const correctCount = Number(correct.rows[0].count);

        res.json({
            total: totalCount,
            correct: correctCount,
            accuracy:
                totalCount === 0
                    ? 0
                    : Number(
                          (
                              correctCount /
                              totalCount *
                              100
                          ).toFixed(2)
                      )
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

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

app.get("/api/trade-stats", async (req,res)=>{

const wins=await db.query(
"SELECT COUNT(*) FROM candle_predictions WHERE result='WIN'"
);

const losses=await db.query(
"SELECT COUNT(*) FROM candle_predictions WHERE result='LOSS'"
);

const win=Number(wins.rows[0].count);

const loss=Number(losses.rows[0].count);

const total=win+loss;

const rate=
total===0
?0
:Number(((win/total)*100).toFixed(1));

res.json({
wins:win,
losses:loss,
rate
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

app.get("/api/predictions-count", async (req, res) => {

    try {

        const result = await db.query(
            "SELECT COUNT(*) FROM predictions"
        );

        res.json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});


app.get("/api/active-predictions", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT *
            FROM candle_predictions
            WHERE result = 'PENDING'
            AND expiry_time > EXTRACT(EPOCH FROM NOW()) * 1000
            ORDER BY prediction_time ASC
        `);

        res.json(result.rows);

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

  /*setInterval(() => {
        updateCandle(marketState);
    },1000);*/

    
async function startServer() {

    const rows = await loadCandles();
loadHistory(rows);
    connectBinance();
    startOpenInterest();
    startFundingRate();
    startLiquidation();

setInterval(async() => {

    updateCandle(marketState);
    const candles = getCandles().history["1m"];

// Only run scheduler when a new closed candle exists
if (candles.length > 0) {
    const lastCandle = candles[candles.length - 1];

    // Only closed candles whose minute is divisible by 5
    const minute = new Date(Number(lastCandle.time)).getUTCMinutes();

    if (minute % 5 === 0) {
        await runScheduler(
            candles,
            marketState,
            db
        );
    }
}
    await checkResults(
    db,
    marketState
);

if (candles.length < 2) return;

const now = Date.now();

const pending = await db.query(`
SELECT *
FROM candle_predictions
WHERE result = 'PENDING'
AND expiry_time <= $1
`, [now]);

for (const row of pending.rows) {

    const currentPrice = marketState.lastPrice;

    let result = "NO TRADE";

if (row.signal === "BUY") {

    result =
        currentPrice > row.open_price
        ? "WIN"
        : "LOSS";

}

if (row.signal === "SELL") {

    result =
        currentPrice < row.open_price
        ? "WIN"
        : "LOSS";

}

if (row.signal === "HOLD") {

    result = "NO TRADE";

}

    await db.query(
        `
        UPDATE candle_predictions
        SET
            close_price = $1,
            result = $2
        WHERE id = $3
        `,
        [
            currentPrice,
            result,
            row.id
        ]
    );

    console.log(
        `Prediction #${row.id}: ${result}`
    );
}
   
const lastCandle =
    candles[candles.length - 1];

    await db.query(
`
UPDATE candle_predictions
SET
close_price = $1,
result =
CASE
WHEN signal='BUY' AND $1 > open_price THEN 'WIN'
WHEN signal='SELL' AND $1 < open_price THEN 'WIN'
ELSE 'LOSS'
END
WHERE result='PENDING'
AND expiry_time <= $2
`,
[
    lastCandle.close,
    lastCandle.time
]
);

if (lastCandle) {
    checkCandlePrediction(lastCandle);   
}

}, 1000);

    app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/api/candleprediction", (req, res) => {

    res.json(getPrediction());

});

    app.get("/api/candle-history", async (req, res) => {

    const result = await db.query(`
        SELECT *
        FROM candle_predictions
        ORDER BY prediction_time DESC
        LIMIT 3
    `);

    res.json(result.rows);

});
    
    app.listen(PORT, () => {
        console.log("==================================");
        console.log("BTC Analytics Server Started");
        console.log("Port:", PORT);
        console.log("==================================");
    });
} 

startServer();
