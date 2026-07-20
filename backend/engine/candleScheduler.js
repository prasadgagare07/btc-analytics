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

    if (current5m.time === lastPredictionTime)
        return;

    lastPredictionTime = current5m.time;

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

            current5m.time,

            current5m.time + 600000,

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
