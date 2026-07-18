function trend(candles) {

    if (!candles || candles.length < 2) return 0;

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    if (last.close > prev.close) return 1;
    if (last.close < prev.close) return -1;

    return 0;
}

function predict(data, indicators, market, pattern) { 
    

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

// Order Book Imbalance
const total = market.buyVolume + market.sellVolume;

if (total > 0) {

    const imbalance =
        ((market.buyVolume - market.sellVolume) / total) * 100;

    if (imbalance > 10)
        score += 15;

    if (imbalance < -10)
        score -= 15;
}
    
    // Candlestick pattern
if (pattern === "BULLISH_ENGULFING")
    score += 20;

if (pattern === "HAMMER")
    score += 15;

if (pattern === "BEARISH_ENGULFING")
    score -= 20;

if (pattern === "DOJI")
    score -= 5;

    // Support & Resistance
const recent = candles1m[candles1m.length - 1];

if (recent) {

    const lows = candles1m.slice(-20).map(c => c.low);
    const highs = candles1m.slice(-20).map(c => c.high);

    const support = Math.min(...lows);
    const resistance = Math.max(...highs);

    if (recent.close <= support * 1.002)
        score += 15;

    if (recent.close >= resistance * 0.998)
        score -= 15;
}

    // Funding Rate
if (market.fundingRate !== undefined) {

    if (market.fundingRate > 0)
        score += 5;

    if (market.fundingRate < 0)
        score -= 5;

}

    // Open Interest
if (market.openInterest > 0) {

    if (market.openInterestChange > 0)
        score += 15;

    if (market.openInterestChange < 0)
        score -= 15;

}

    // Liquidations
if (market.liquidationSide === "SELL")
    score += 20;

if (market.liquidationSide === "BUY")
    score -= 20;
    
    let signal = "HOLD";

    if (score >= 40)
        signal = "BUY";
    else if (score <= -40)
        signal = "SELL";

    return {
        signal,
        confidence: Math.min(Math.abs(score), 100),
    };
}

module.exports = {
    predict
};
