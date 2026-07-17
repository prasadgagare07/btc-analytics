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

module.exports = {
    addPrediction,
    getHistory
};
