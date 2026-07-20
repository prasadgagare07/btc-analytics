let activePrediction = null;

function setPrediction(prediction) {
    activePrediction = prediction;
}

function getPrediction() {
    return activePrediction;
}

module.exports = {
    setPrediction,
    getPrediction
};
