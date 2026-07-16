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
const labels = [];
const prices = [];

function initChart() {

    const ctx = document.getElementById("priceChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "BTC Price",
                data: prices,
                borderWidth: 2,
                tension: 0.2
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

        const now = new Date().toLocaleTimeString();

        labels.push(now);
        prices.push(data.lastPrice);

        if (labels.length > 30) {
            labels.shift();
            prices.shift();
        }

        chart.update();

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

initChart();

loadStatus();
loadMarket();
loadIndicators();

setInterval(() => {

    loadStatus();
    loadMarket();
    loadIndicators();

}, 2000);
