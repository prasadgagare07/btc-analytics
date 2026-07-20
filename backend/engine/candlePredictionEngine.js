let activePrediction = null;

function setPrediction(prediction) {
    activePrediction = prediction;
}

function getPrediction() {
    return activePrediction;
}

function checkPrediction(lastClosed5m) {

    if (!activePrediction) return;

    if (activePrediction.status !== "Pending") return;

    if (lastClosed5m.time < activePrediction.expiryTime) return;

    if (activePrediction.signal === "BUY") {

        activePrediction.status =
            lastClosed5m.close > activePrediction.openPrice
                ? "WIN"
                : "LOSS";

    }

    else if (activePrediction.signal === "SELL") {

        activePrediction.status =
            lastClosed5m.close < activePrediction.openPrice
                ? "WIN"
                : "LOSS";

    }

}

module.exports = {
    setPrediction,
    getPrediction,
    checkPrediction
};
