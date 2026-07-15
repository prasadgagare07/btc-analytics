const candles = {
  "1m": [],
  "3m": [],
  "5m": [],
  "10m": []
};

let current1m = null;

function updateCandle(market) {
  const now = Date.now();
  const minute = Math.floor(now / 60000) * 60000;

  if (!current1m || current1m.time !== minute) {
    if (current1m) {
      candles["1m"].push(current1m);

      if (candles["1m"].length > 500) {
        candles["1m"].shift();
      }
    }

    current1m = {
      time: minute,
      open: market.lastPrice,
      high: market.lastPrice,
      low: market.lastPrice,
      close: market.lastPrice,
      buyVolume: 0,
      sellVolume: 0,
      delta: 0,
      cvd: market.cvd,
      trades: 0
    };
  }

  current1m.close = market.lastPrice;
  current1m.high = Math.max(current1m.high, market.lastPrice);
  current1m.low = Math.min(current1m.low, market.lastPrice);

  current1m.buyVolume = market.buyVolume;
  current1m.sellVolume = market.sellVolume;
  current1m.delta = market.delta;
  current1m.cvd = market.cvd;
  current1m.trades = market.tradeCount;
}

function getCandles() {
  return {
    current: current1m,
    history: candles
  };
}

module.exports = {
  updateCandle,
  getCandles
};
