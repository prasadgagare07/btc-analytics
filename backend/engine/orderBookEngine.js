function analyzeOrderBook(market) {

    const buy = Number(market.buyVolume || 0);
    const sell = Number(market.sellVolume || 0);

    const total = buy + sell;

    if (total === 0) {
        return {
            imbalance: 0,
            side: "NEUTRAL"
        };
    }

    const imbalance = ((buy - sell) / total) * 100;

    let side = "NEUTRAL";

    if (imbalance > 10)
        side = "BUY";

    if (imbalance < -10)
        side = "SELL";

    return {
        imbalance: Number(imbalance.toFixed(2)),
        side
    };
}

module.exports = {
    analyzeOrderBook
};
