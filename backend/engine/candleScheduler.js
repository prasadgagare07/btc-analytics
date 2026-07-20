const {
    aggregate
} = require("./timeframeEngine");

const {
    calculateEMA,
    calculateRSI
} = require("./indicatorEngine");

const {
    detectPattern
} = require("./patternEngine");

const {
    predict
} = require("./predictionEngine");

let lastPredictionTime = 0;

async function runScheduler(
    candles,
    marketState,
    db
) {

    const candles5m = aggregate(candles, 5);

    const current5m =
        candles5m[candles5m.length - 1];

    if (!current5m)
        return;

    const predictionTime =
        Math.floor(
            current5m.time / (5 * 60 * 1000)
        ) * (5 * 60 * 1000);

    const expiryTime =
        predictionTime + (10 * 60 * 1000);

    if (predictionTime === lastPredictionTime)
        return;

    lastPredictionTime = predictionTime;

    const indicators = {

        ema9:
            calculateEMA(candles, 9),

        ema21:
            calculateEMA(candles, 21),

        rsi:
            calculateRSI(candles)

    };

    const prediction = predict(

        {
            candles1m: candles,
            candles3m: aggregate(candles, 3),
            candles5m,
            candles10m: aggregate(candles, 10)
        },

        indicators,

        marketState,

        detectPattern(candles)

    );

    await db.query(

        `INSERT INTO candle_predictions
        (prediction_time,
         expiry_time,
         open_price,
         signal,
         confidence,
         result)

         VALUES ($1,$2,$3,$4,$5,'PENDING')`,

        [

            predictionTime,

            expiryTime,

            current5m.open,

            prediction.signal,

            prediction.confidence

        ]

    );

    console.log(
        "New 5-minute prediction created."
    );

}

module.exports = {
    runScheduler
};
