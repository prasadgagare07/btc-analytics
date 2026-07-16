let chart;

async function loadStatus() {

    try {

        const res = await fetch("/api/status");
        const data = await res.json();

        document.getElementById("status").innerHTML = data.status;

    } catch {

        document.getElementById("status").innerHTML = "Server Offline";

    }

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

        const chartData = candles.map(c => ({
            x: new Date(c.time),
            o: c.open,
            h: c.high,
            l: c.low,
            c: c.close
        }));

        if (!chart) {

            const ctx = document
                .getElementById("priceChart")
                .getContext("2d");

            chart = new Chart(ctx, {
                type: "candlestick",
                data: {
                    datasets: [{
                        label: "BTCUSDT",
                        data: chartData
                    }]
                },
                options: {
                    responsive: true,
                    animation: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    }
                }
            });

        } else {

            chart.data.datasets[0].data = chartData;
            chart.update();

        }

    } catch (err) {

        console.log(err);

    }

}

async function refresh() {

    await loadStatus();
    await loadMarket();
    await loadIndicators();
    await loadChart();

}

refresh();

setInterval(refresh, 2000);

           
