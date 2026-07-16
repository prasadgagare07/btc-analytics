async function loadStatus() {

    try {

        const res = await fetch("/api/status");
        const data = await res.json();

        document.getElementById("status").innerHTML = data.status;

    } catch {

        document.getElementById("status").innerHTML = "Server Offline";

    }

}

let chart;

function initChart() {

    const ctx = document.getElementById("priceChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "candlestick",
        data: {
            datasets: [{
                label: "BTCUSDT",
                data: []
            }]
        },
        options: {
            responsive: true,
            animation: false
        }
    });

}

async function loadMarket() {

    try {

        const res = await fetch("/api/market");
        const data = await res.json();

        document.getElementById("price").innerHTML = data.lastPrice ?? "-";
        document.getElementById("buyVolume").innerHTML = data.buyVolume ?? "-";
        document.getElementById("sellVolume").innerHTML = data.sellVolume ?? "-";
        document.getElementById("delta").innerHTML = data.delta ?? "-";

    } catch (err) {

        console.log(err);

    }

}

async function loadIndicators() {

    try {

        const res = await fetch("/api/indicators");
        const data = await res.json();

        document.getElementById("ema9").innerHTML = data.ema9 ?? "-";
        document.getElementById("ema21").innerHTML = data.ema21 ?? "-";
        document.getElementById("rsi").innerHTML = data.rsi ?? "-";

    } catch (err) {

        console.log(err);

    }

}

async function loadChart() {

    try {

        const res = await fetch("/api/candles");
        const data = await res.json();

        const candles = data.history["1m"];

        chart.data.datasets[0].data = candles.map(c => ({
            x: new Date(c.time),
            o: c.open,
            h: c.high,
            l: c.low,
            c: c.close
        }));

        chart.update();

    } catch (err) {

        console.log(err);

    }

}

initChart();

loadStatus();
loadMarket();
loadIndicators();
loadChart();

setInterval(() => {

    loadStatus();
    loadMarket();
    loadIndicators();
    loadChart();

}, 2000);
