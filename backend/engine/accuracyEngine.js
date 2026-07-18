 let predictions = [];

function addPrediction(signal, price, candleTime) {

    predictions.push({
        signal,
        price,
        candleTime,
        checked: false
    });

}

function checkPrediction(candle) {

    predictions.forEach(p => {

        if (p.checked) return;

        if (candle.time <= p.candleTime)
            return;

        const actual =
            candle.close > candle.open
                ? "BUY"
                : "SELL";

        p.actual = actual;
        p.correct = actual === p.signal;
        p.checked = true;

    });

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
                : Number(
                      (
                          correct.length /
                          checked.length *
                          100
                      ).toFixed(2)
                  )

    };

}

module.exports = {
    addPrediction,
    checkPrediction,
    getAccuracy
};
