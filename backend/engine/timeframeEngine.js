function aggregate(candles, size) {
    const result = [];

    for (let i = 0; i + size <= candles.length; i += size) {
        const group = candles.slice(i, i + size);

        result.push({
            time: group[0].time,

            open: group[0].open,
            high: Math.max(...group.map(c => c.high)),
            low: Math.min(...group.map(c => c.low)),
            close: group[group.length - 1].close,

            buyVolume: group.reduce((a, c) => a + c.buyVolume, 0),
            sellVolume: group.reduce((a, c) => a + c.sellVolume, 0),

            delta: group.reduce((a, c) => a + c.delta, 0),

            cvd: group[group.length - 1].cvd,

            trades: group.reduce((a, c) => a + c.trades, 0)
        });
    }

    return result;
}

module.exports = {
    aggregate
};
