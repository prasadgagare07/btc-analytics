let history = [];

function addResult(prediction, actual) {

    history.push({
        prediction,
        actual,
        correct: prediction === actual
    });

    if (history.length > 1000) {
        history.shift();
    }

}

function getAccuracy() {

    const total = history.length;

    const correct = history.filter(r => r.correct).length;

    return {
        total,
        correct,
        accuracy:
            total === 0
                ? 0
                : Number((correct / total * 100).toFixed(2))
    };

}

module.exports = {
    addResult,
    getAccuracy
};
