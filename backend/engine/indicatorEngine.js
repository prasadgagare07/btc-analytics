function calculateEMA(candles, period) {

    if (candles.length < period) return null;

    const k = 2 / (period + 1);

    let ema = candles[0].close;

    for (let i = 1; i < candles.length; i++) {
        ema = candles[i].close * k + ema * (1 - k);
    }

    return Number(ema.toFixed(2));
}
function calculateRSI(candles, period = 14) {

    if (candles.length <= period) return null;

    let gains = 0;
    let losses = 0;

    for (let i = candles.length - period; i < candles.length; i++) {

        const change = candles[i].close - candles[i - 1].close;

        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }

    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;

    return Number((100 - (100 / (1 + rs))).toFixed(2));

}
module.exports = {
    calculateEMA,
    calculateRSI
};
