const { calculateATR } = require("./atrEngine");

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
    let bullishTrends = 0;
    let bearishTrends = 0;
    let confirmations = 0;

    // Multi-timeframe trend
    const t1 = trend(candles1m);
    const t3 = trend(candles3m);
    const t5 = trend(candles5m);
    const t10 = trend(candles10m);

score += t1 * 20;
score += t3 * 20;
score += t5 * 25;
score += t10 * 35;

[t1, t3, t5, t10].forEach(t => {
    if (t > 0) bullishTrends++;
    if (t < 0) bearishTrends++;
});

if (bullishTrends >= 3)
    score += 25;

if (bearishTrends >= 3)
    score -= 25;

// Strong trend bonus
if (bullishTrends === 4)
    score += 20;

if (bearishTrends === 4)
    score -= 20;

// Weak trend penalty
if (bullishTrends === 2 && bearishTrends === 2)
    score = Math.floor(score * 0.6);
    // EMA
    if (indicators.ema9 > indicators.ema21) {
    score += 20;
    confirmations++;
} else {
    score -= 20;
}

    // RSI
    
if (indicators.rsi > 60) {
    score += 15;
    confirmations++;
} else if (indicators.rsi < 40) {
    score -= 15;
}
    // Order flow
    if (market.buyVolume > market.sellVolume) {
    score += 15;
    confirmations++;
} else {
    score -= 15;
}

    if (market.delta > 0) {
    score += 15;
    confirmations++;
} else {
    score -= 15;
}

    // CVD
if (market.cvd > 0) {
    score += 20;
    confirmations++;
}
else if (market.cvd < 0)
    score -= 20;

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
    // Ignore weak signals
if (Math.abs(score) < 50) {

    const price = market.lastPrice || 0;

    return {
        signal: "HOLD",
        confidence: 0,
        entry: price.toFixed(2),
        sl: "-",
        tp: "-"
    };
}
    // Signal agreement bonus
let bullish = 0;
let bearish = 0;

if (indicators.ema9 > indicators.ema21) bullish++;
else bearish++;

if (market.delta > 0) bullish++;
else bearish++;

if (market.cvd > 0) bullish++;
else bearish++;

if (market.buyVolume > market.sellVolume) bullish++;
else bearish++;

if (bullish >= 3)
    score += 20;

if (bearish >= 3)
    score -= 20;
    
    let signal = "HOLD";

    if (score >= 60)
    signal = "BUY";
else if (score <= -60)
    signal = "SELL";
else
    signal = "HOLD";

    const price = market.lastPrice || 0;

let entry = price;
let sl = price;
let tp = price;

const atr = calculateATR(candles1m);

const stopDistance = atr > 0 ? atr * 1.5 : price * 0.005;
const targetDistance = atr > 0 ? atr * 3 : price * 0.01;

if (signal === "BUY") {
    sl = price - stopDistance;
    tp = price + targetDistance;
}

if (signal === "SELL") {
    sl = price + stopDistance;
    tp = price - targetDistance;
}

let confidence = 0;

if (signal !== "HOLD") {
    confidence = Math.min(
        Math.round((Math.abs(score) / 220) * 100),
        95
    );

    if (confidence < 55) confidence = 55;
}

return {
    signal,
    confidence,
    entry: entry.toFixed(2),
    sl: sl.toFixed(2),
    tp: tp.toFixed(2)
};
}

module.exports = {
    predict
};
