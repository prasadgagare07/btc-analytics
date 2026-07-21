const marketState = require("../data/marketState");


const marketState = require("../data/marketState");

function processTrade(trade) {

    const price = Number(trade.p);

    const qty = Number(trade.q);

    const volume = price * qty;

    marketState.lastPrice = price;

    marketState.tradeCount++;

    if (trade.m) {

        // Seller Aggressive
        marketState.sellVolume += volume;

        marketState.delta -= volume;

        marketState.cvd -= volume;

        marketState.aggressiveSellVolume += volume;

        if (volume >= 50000) {
            marketState.largeSellOrders++;
        }

        if (volume > marketState.largestSell) {
            marketState.largestSell = volume;
        }

    } else {

        // Buyer Aggressive
        marketState.buyVolume += volume;

        marketState.delta += volume;

        marketState.cvd += volume;

        marketState.aggressiveBuyVolume += volume;

        if (volume >= 50000) {
            marketState.largeBuyOrders++;
        }

        if (volume > marketState.largestBuy) {
            marketState.largestBuy = volume;
        }

    }

    const total =
        marketState.aggressiveBuyVolume +
        marketState.aggressiveSellVolume;

    marketState.aggressiveRatio =
        total === 0
            ? 50
            : Number(
                (
                    marketState.aggressiveBuyVolume /
                    total
                ) * 100
            ).toFixed(2);

}

module.exports = {
    processTrade
};


module.exports = {

processTrade

};
