alert("SCRIPT LOADED");

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
        alert(err.message);
    }
}

async function loadOrderBook() {

    try {

        const res = await fetch("/api/orderbook");
        const data = await res.json();

        document.getElementById("imbalance").innerHTML =
            data.imbalance + "%";

        document.getElementById("orderSignal").innerHTML =
            data.side;

    } catch (err) {

        console.log(err);
        alert(err.message);

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
        alert(err.message);
    }
}

async function loadPrediction() {

    try {

        const res = await fetch("/api/prediction");
        const data = await res.json();
        alert(JSON.stringify(data));

        document.getElementById("signal").innerHTML = data.signal;
document.getElementById("confidence").innerHTML = data.confidence + "%";

document.getElementById("entry").innerHTML = data.entry;
document.getElementById("sl").innerHTML = data.sl;
document.getElementById("tp").innerHTML = data.tp;

    } catch (err) {

        console.log(err);
        alert(err.message);

    }

}
async function loadAccuracy() {

    try {

        const res = await fetch("/api/accuracy");
        const data = await res.json();

        document.getElementById("accuracy").innerHTML =
            data.accuracy + "%";

    } catch (err) {

        console.log(err);
        alert(err.message);

    }

    }

        async function loadOpenInterest() {

    try {

        const res = await fetch("/api/market");
        const data = await res.json();

        document.getElementById("oi").innerHTML =
            data.openInterest ?? 0;

    } catch (err) {

        console.log(err);
        alert(err.message);

    }

        }

    async function loadFunding() {

    try {

        const res = await fetch("/api/market");
        const data = await res.json();

        document.getElementById("funding").innerHTML =
            data.fundingRate ?? 0;

    } catch (err) {

        console.log(err);
        alert(err.message);

    }

    }

        async function loadLiquidations() {

    try {

        const res = await fetch("/api/market");
        const data = await res.json();

        document.getElementById("liquidations").innerHTML =
            data.liquidationSide ?? "None";

    } catch (err) {

        console.log(err);
        alert(err.message);

    }

        }
       async function loadChart() {

    try {

        const res = await fetch("/api/candles");
        const data = await res.json();

        const candles = data.history["1m"];
        
        console.log(candles);
        console.log(candles.length);
        
        console.log(window.LightweightCharts);
        console.log(chart);
        console.log(candleSeries);
        const chartData = candles.map(c => ({
    time: Math.floor(Number(c.time) / 1000),
    open: Number(c.open),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close)
}));

        console.log(chartData);
        
        if (!chart) {
            const container = document.getElementById("priceChart");

chart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 400
});

            console.log(chart);

if (typeof chart.addCandlestickSeries === "function") {
    candleSeries = chart.addCandlestickSeries();
} else {
    alert("addCandlestickSeries not found");
}
            
        }

        console.log(chartData.slice(0, 5));
        console.log(chartData[0]);
        console.log(chartData[chartData.length - 1]);
        candleSeries.setData(chartData);

    } catch (err) {
        console.error(err);
        alert(err.stack);
        alert(err.message);
    }

}
        

async function refresh() {
    try {
        await loadStatus();
        await loadMarket();
        await loadOrderBook();
        await loadIndicators();
        await loadPrediction();
        await loadAccuracy();
        await loadOpenInterest();
        await loadFunding();
        await loadLiquidations();
        //await loadChart();
    } catch (err) {
        console.error("Refresh error:", err);
        alert(err.message);
    }
}

refresh();

setInterval(refresh, 2000);
