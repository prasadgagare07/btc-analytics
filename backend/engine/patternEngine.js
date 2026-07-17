function detectPattern(candles) {

    if (candles.length < 2) {
        return "NONE";
    }

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    // Bullish Engulfing
    if (
        prev.close < prev.open &&
        last.close > last.open &&
        last.open < prev.close &&
        last.close > prev.open
    ) {
        return "BULLISH_ENGULFING";
    }

    // Bearish Engulfing
    if (
        prev.close > prev.open &&
        last.close < last.open &&
        last.open > prev.close &&
        last.close < prev.open
    ) {
        return "BEARISH_ENGULFING";
    }

    // Doji
    if (Math.abs(last.close - last.open) < (last.high - last.low) * 0.1) {
        return "DOJI";
    }

    // Hammer
    const body = Math.abs(last.close - last.open);
    const lowerShadow = Math.min(last.open, last.close) - last.low;
    const upperShadow = last.high - Math.max(last.open, last.close);

    if (
        lowerShadow > body * 2 &&
        upperShadow < body
    ) {
        return "HAMMER";
    }

    return "NONE";
}

module.exports = {
    detectPattern
};
