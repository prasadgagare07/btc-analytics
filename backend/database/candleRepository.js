const pool = require("./db");

async function saveCandle(candle) {
    await pool.query(
        `INSERT INTO candles
        (time, open, high, low, close, buy_volume, sell_volume, delta, cvd, trades)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
            candle.time,
            candle.open,
            candle.high,
            candle.low,
            candle.close,
            candle.buyVolume,
            candle.sellVolume,
            candle.delta,
            candle.cvd,
            candle.trades
        ]
    );
}

async function loadCandles() {

    const result = await pool.query(
        "SELECT * FROM candles ORDER BY time ASC"
    );

    return result.rows;

}

module.exports = {
    saveCandle,
    loadCandles
};
