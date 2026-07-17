const history = [];

function addPrediction(prediction) {
    history.push(prediction);

    if (history.length > 1000) {
        history.shift();
    }
}

function getHistory() {
    return history;
}

function getStats() {

    const total = history.length;

    const buy = history.filter(p => p.signal === "BUY").length;
    const sell = history.filter(p => p.signal === "SELL").length;
    const hold = history.filter(p => p.signal === "HOLD").length;

    return {
        total,
        buy,
        sell,
        hold
    };
}

module.exports = {
    addPrediction,
    getHistory,
    getStats
};
