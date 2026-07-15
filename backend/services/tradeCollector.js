const marketState = require("../data/marketState");

function processTrade(trade){

    const price = Number(trade.p);

    const qty = Number(trade.q);

    const volume = price * qty;

    marketState.lastPrice = price;

    marketState.tradeCount++;

    if(trade.m){

        marketState.sellVolume += volume;

        marketState.delta -= volume;

        marketState.cvd -= volume;

        if(volume > marketState.largestSell){

            marketState.largestSell = volume;

        }

    }else{

        marketState.buyVolume += volume;

        marketState.delta += volume;

        marketState.cvd += volume;

        if(volume > marketState.largestBuy){

            marketState.largestBuy = volume;

        }

    }

}

module.exports = {

processTrade

};
