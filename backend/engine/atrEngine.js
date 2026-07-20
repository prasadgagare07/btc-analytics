function calculateATR(candles, period = 14) {
    if (!candles || candles.length < period + 1) return 0;

    let trs = [];

    for (let i = 1; i < candles.length; i++) {
        const current = candles[i];
        const previous = candles[i - 1];

        const tr = Math.max(
            current.high - current.low,
            Math.abs(current.high - previous.close),
            Math.abs(current.low - previous.close)
        );

        trs.push(tr);
    }

    const recent = trs.slice(-period);

    return recent.reduce((a, b) => a + b, 0) / period;
}

module.exports = {
    calculateATR
};
