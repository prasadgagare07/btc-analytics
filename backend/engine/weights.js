let weights = {
    trend: 25,
    ema: 20,
    rsi: 15,
    orderFlow: 15,
    cvd: 20,
    imbalance: 15,
    pattern: 20,
    support: 15,
    funding: 5,
    openInterest: 15,
    liquidation: 20
};

function getWeights() {
    return weights;
}

module.exports = {
    getWeights
};
