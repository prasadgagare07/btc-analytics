const { aggregate } = require("./timeframeEngine");
const { calculateEMA, calculateRSI } = require("./indicatorEngine");
const { detectPattern } = require("./patternEngine");
const { predict } = require("./predictionEngine");

async function runScheduler(
    candles,
    marketState,
    db
) {

    const current =
        candles[candles.length - 1];

    if (!current) return;

    // Round to nearest 5-minute candle
    const predictionTime =
        Math.floor(
            current.time / (5 * 60 * 1000)
        ) * (5 * 60 * 1000);

    // Prediction expires after 10 minutes
    const expiryTime =
        predictionTime + (10 * 60 * 1000);

    // Prevent duplicate prediction for same 5-minute candle
    const exists = await db.query(
        `
        SELECT id
        FROM candle_predictions
        WHERE prediction_time = $1
        LIMIT 1
        `,
        [predictionTime]
    );

    if (exists.rows.length > 0) {
        return;
    }

    const indicators = {
        ema9: calculateEMA(candles, 9),
        ema21: calculateEMA(candles, 21),
        rsi: calculateRSI(candles)
    };

    const prediction = predict(
        {
            candles1m: candles,
            candles3m: aggregate(candles, 3),
            candles5m: aggregate(candles, 5),
            candles10m: aggregate(candles, 10)
        },
        indicators,
        marketState,
        detectPattern(candles)
    );

    await db.query(
        `
        INSERT INTO candle_predictions
        (
            prediction_time,
            expiry_time,
            open_price,
            close_price,
            signal,
            confidence,
            result
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            'PENDING'
        )
        `,
        [
            predictionTime,
            expiryTime,
            current.open,
            null,
            prediction.signal,
            prediction.confidence
        ]
    );

    console.log(
        "New 5-minute prediction:",
        new Date(predictionTime).toLocaleTimeString()
    );

}

module.exports = {
    runScheduler
};
