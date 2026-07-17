function predict(candles, indicators, market) {

    if (candles.length < 21) {
        return {
            signal: "WAIT",
            confidence: 0
        };
    }

    let score = 0;

    // EMA Trend
    if (indicators.ema9 > indicators.ema21)
        score += 25;
    else
        score -= 25;

    // RSI
    if (indicators.rsi > 60)
        score += 15;
    else if (indicators.rsi < 40)
        score -= 15;

    // Delta
    if (market.delta > 0)
        score += 20;
    else
        score -= 20;

    // CVD
    if (market.cvd > 0)
        score += 20;
    else
        score -= 20;

    // Buy/Sell Volume
    if (market.buyVolume > market.sellVolume)
        score += 20;
    else
        score -= 20;

    let signal = "HOLD";

    if (score >= 30)
        signal = "BUY";

    if (score <= -30)
        signal = "SELL";

    return {
        signal,
        confidence: Math.min(Math.abs(score), 100)
    };
}

module.exports = {
    predict
};
