function trend(candles) {

    if (!candles || candles.length < 2) return 0;

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    if (last.close > prev.close) return 1;
    if (last.close < prev.close) return -1;

    return 0;
}

function predict(data, indicators, market) {

    const {
        candles1m,
        candles3m,
        candles5m,
        candles10m
    } = data;

    let score = 0;

    // Multi-timeframe trend
    score += trend(candles1m) * 20;
    score += trend(candles3m) * 20;
    score += trend(candles5m) * 25;
    score += trend(candles10m) * 35;

    // EMA
    if (indicators.ema9 > indicators.ema21)
        score += 20;
    else
        score -= 20;

    // RSI
    if (indicators.rsi > 60)
        score += 15;
    else if (indicators.rsi < 40)
        score -= 15;

    // Order flow
    if (market.buyVolume > market.sellVolume)
        score += 15;
    else
        score -= 15;

    if (market.delta > 0)
        score += 15;
    else
        score -= 15;

    let signal = "HOLD";

    if (score >= 40)
        signal = "BUY";
    else if (score <= -40)
        signal = "SELL";

    return {
        signal,
        confidence: Math.min(Math.abs(score), 100)
    };
}

module.exports = {
    predict
};
