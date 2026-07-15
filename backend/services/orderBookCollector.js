const marketState = require("../data/marketState");

function processBookTicker(data) {

    const bid = Number(data.b);
    const ask = Number(data.a);

    const bidQty = Number(data.B);
    const askQty = Number(data.A);

    marketState.bestBid = bid;
    marketState.bestAsk = ask;

    marketState.bidQty = bidQty;
    marketState.askQty = askQty;

    marketState.spread = ask - bid;

    const total = bidQty + askQty;

    if (total > 0) {
        marketState.orderBookImbalance =
            (bidQty - askQty) / total;
    } else {
        marketState.orderBookImbalance = 0;
    }

}

module.exports = {
    processBookTicker
};
