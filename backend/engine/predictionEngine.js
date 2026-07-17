function predict(candles, indicators, market) {

    if (!candles.length) {
        return {
            signal: "WAIT",
            confidence: 0
        };
    }

    let score = 0;

    // EMA Trend
    if (indicators.ema9 > indicators.ema21) {
        score += 30;
    } else {
        score -= 30;
    }

    // RSI
    if (indicators.rsi > 55) {
        score += 20;
    } else if (indicators.rsi < 45) {
        score -= 20;
    }

    // Delta
    if (market.delta > 0) {
        score += 25;
    } else {
        score -= 25;
    }

    // Buy vs Sell Volume
    if (market.buyVolume > market.sellVolume) {
        score += 25;
    } else {
        score -= 25;
    }

    return {
        signal: score >= 0 ? "BUY" : "SELL",
        confidence: Math.abs(score)
    };
}

module.exports = {
    predict
};
