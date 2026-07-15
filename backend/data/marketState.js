const marketState = {
    lastPrice: 0,

    buyVolume: 0,
    sellVolume: 0,

    delta: 0,
    cvd: 0,

    tradeCount: 0,

    largestBuy: 0,
    largestSell: 0

    bestBid: 0,
bestAsk: 0,

bidQty: 0,
askQty: 0,

spread: 0,

orderBookImbalance: 0,
};

module.exports = marketState;
