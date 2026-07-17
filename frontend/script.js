let chart;
let candleSeries;

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
        document.getElementById("buyVolume").innerHTML = Number(data.buyVolume ?? 0).toFixed(2);
        document.getElementById("sellVolume").innerHTML = Number(data.sellVolume ?? 0).toFixed(2);
        document.getElementById("delta").innerHTML = Number(data.delta ?? 0).toFixed(2);
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

    const res = await fetch("/api/candles");
    const data = await res.json();

    const candles = data.history["1m"];

    const chartData = candles.map(c => ({
        time: Math.floor(c.time / 1000),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
    }));

    if (!chart) {

        chart = LightweightCharts.createChart(
            document.getElementById("priceChart"),
            {
                width: document.getElementById("priceChart").clientWidth,
                height: 400
            }
        );

        candleSeries = chart.addCandlestickSeries();
    }

    candleSeries.setData(chartData);
}

async function refresh() {
    await loadStatus();
    await loadMarket();
    await loadIndicators();
    await loadChart();
}

refresh();

setInterval(refresh, 2000);
