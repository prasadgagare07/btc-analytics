 let predictions = [];

function addPrediction(signal, closePrice) {

    predictions.push({
        signal,
        closePrice,
        time: Date.now()
    });

    if (predictions.length > 1000) {
        predictions.shift();
    }

}

function checkLastPrediction(currentClose) {

    if (predictions.length === 0) return;

    const last = predictions[predictions.length - 1];

    if (last.checked) return;

    if (last.signal === "BUY")
        last.correct = currentClose > last.closePrice;

    else if (last.signal === "SELL")
        last.correct = currentClose < last.closePrice;

    else
        last.correct = true;

    last.checked = true;

}

function getAccuracy() {

    const checked = predictions.filter(p => p.checked);

    const correct = checked.filter(p => p.correct);

    return {
        total: checked.length,
        correct: correct.length,
        accuracy:
            checked.length === 0
                ? 0
                : Number((correct.length / checked.length * 100).toFixed(2))
    };

}

module.exports = {
    addPrediction,
    checkLastPrediction,
    getAccuracy
};
