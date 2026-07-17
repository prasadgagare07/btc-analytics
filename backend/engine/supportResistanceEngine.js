function detectLevels(candles) {

    if (!candles || candles.length < 20) {
        return {
            support: null,
            resistance: null
        };
    }

    const recent = candles.slice(-20);

    const support = Math.min(...recent.map(c => c.low));
    const resistance = Math.max(...recent.map(c => c.high));

    return {
        support,
        resistance
    };
}

module.exports = {
    detectLevels
};
