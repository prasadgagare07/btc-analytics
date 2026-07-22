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
        //alert(err.message);
    }
}

async function loadstreaks() {

    const res = await fetch("/api/streaks");
    const data = await res.json();

    document.getElementById("winStreak").innerHTML =
        data.currentWin;

    document.getElementById("lossStreak").innerHTML =
        data.currentLoss;

    document.getElementById("noTradeStreak").innerHTML =
        data.currentNoTrade;

    document.getElementById("maxWinStreak").innerHTML =
        data.maxWin;

    document.getElementById("maxLossStreak").innerHTML =
        data.maxLoss;

    document.getElementById("maxNoTradeStreak").innerHTML =
        data.maxNoTrade;

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
        //alert(err.message);

    }

}
async function loadProbability(){

    const res = await fetch("/api/probability");

    const data = await res.json();

    document.getElementById("buyProb").innerHTML =
        data.buy + "%";

    document.getElementById("sellProb").innerHTML =
        data.sell + "%";

    document.getElementById("buyProbBar").style.width =
        data.buy + "%";

    document.getElementById("sellProbBar").style.width =
        data.sell + "%";

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

        document.getElementById("signal").innerHTML =
            data.signal ?? "-";

        document.getElementById("confidence").innerHTML =
            (data.confidence ?? 0) + "%";

        document.getElementById("entry").innerHTML =
            data.entry ?? "-";

        document.getElementById("target").innerHTML =
            data.target ?? "-";

        document.getElementById("reasons").innerHTML =
            data.reasons
                ? data.reasons.join(", ")
                : "-";

        document.getElementById("tradeDuration").innerHTML =
            data.tradeDuration ?? "-";

    } catch (err) {

        console.log(err);

    }

}

async function loadStreak() {

    const res = await fetch("/api/streak");

    const data = await res.json();

    document.getElementById("winStreak").innerHTML =
        data.currentWin;

    document.getElementById("lossStreak").innerHTML =
        data.currentLoss;

    document.getElementById("noTradeStreak").innerHTML =
        data.currentNoTrade;

    document.getElementById("maxWinStreak").innerHTML =
        data.maxWin;

    document.getElementById("maxLossStreak").innerHTML =
        data.maxLoss;

    document.getElementById("maxNoTradeStreak").innerHTML =
        data.maxNoTrade;

}

async function loadTradeStats(){

const res=
await fetch("/api/trade-stats");

const data=
await res.json();

document.getElementById("winRate").innerHTML=
data.rate+"%";

document.getElementById("wins").innerHTML=
data.wins;

document.getElementById("losses").innerHTML=
data.losses;

document.getElementById("winRateBar").style.width=
data.rate+"%";

}

async function loadActivePredictions() {

    try {

        const res = await fetch("/api/candle-history");
        const predictions = await res.json();

        let html = "";

        predictions.forEach(p => {

            const predictionTime =
                new Date(Number(p.prediction_time))
                .toLocaleTimeString();

            const expiryTime =
                new Date(Number(p.expiry_time))
                .toLocaleTimeString();

            html += `
<div class="prediction-card ${p.result}">

<h3>${p.signal}</h3>

<p><b>Confidence:</b> ${p.confidence}%</p>

<div class="progress">
<div style="width:${p.confidence}%"></div>
</div>

<p><b>Prediction:</b> ${predictionTime}</p>

<p><b>Expiry:</b> ${expiryTime}</p>

<p class="status">${p.result}</p>

${
    p.result === "PENDING"
    ? `<p>Remaining:
        <span id="timer-${p.id}"></span>
       </p>`
    : ""
}

</div>
`;

        });

        if (predictions.length === 0) {
            html = "No predictions";
        }

        document.getElementById("activePredictions").innerHTML = html;

        predictions
            .filter(p => p.result === "PENDING")
            .forEach(p => {

                startPredictionTimer(
                    p.id,
                    Number(p.expiry_time)
                );

            });

    } catch (err) {

        console.log(err);

    }

}

async function loadLastTrades(){

    const res = await fetch("/api/last-trades");

    const trades = await res.json();

    let html = "";

    trades.forEach(t=>{

        let cls="pending";

        if(t.result==="WIN")
            cls="win";

        if(t.result==="LOSS")
            cls="loss";

        html+=`<div class="trade-box ${cls}" title="${t.result}"></div>`;

    });

    document.getElementById("lastTrades").innerHTML=html;

}

async function loadLiveBias(){

    const res = await fetch("/api/prediction");

    const data = await res.json();

    document.getElementById("liveBias").innerHTML =
        data.signal;

    document.getElementById("liveStrength").innerHTML =
        data.confidence + "%";

    document.getElementById("liveStrengthBar").style.width =
        data.confidence + "%";

}

function startPredictionTimer(id, expiryTime) {

    function update() {

        const remaining = expiryTime - Date.now();

        const element = document.getElementById(`timer-${id}`);

        if (!element) return;

        if (remaining <= 0) {
            element.innerHTML = "Expired";
            return;
        }

        const min = Math.floor(remaining / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);

        element.innerHTML =
            `${min}:${sec.toString().padStart(2, "0")}`;
    }

    update();

    setInterval(update, 1000);
}

async function loadAccuracy() {

    const res = await fetch("/api/accuracy");
    const data = await res.json();

    document.getElementById("accuracy").innerHTML =
        data.accuracy + "%";
}

async function loadOpenInterest() {

    const res = await fetch("/api/market");
    const data = await res.json();

    document.getElementById("oi").innerHTML =
        data.openInterest ?? 0;
}

async function loadFunding() {

    const res = await fetch("/api/market");
    const data = await res.json();

    document.getElementById("funding").innerHTML =
        data.fundingRate ?? 0;
}

async function loadLiquidations() {

    const res = await fetch("/api/market");
    const data = await res.json();

    document.getElementById("liquidations").innerHTML =
        data.liquidationSide ?? "None";
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
        //alert(err.stack);
        //alert(err.message);
    }

}

function startCountdown(expiryTime) {

    function update() {

        const now = Date.now();

        const remaining = expiryTime - now;

        if (remaining <= 0) {
            document.getElementById("countdown").innerHTML = "Expired";
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        document.getElementById("countdown").innerHTML =
            `${minutes}:${seconds.toString().padStart(2, "0")}`;

    }

    update();

    setInterval(update, 1000);

}

async function refresh() {
    await loadStatus();
    await loadMarket();
    await loadOrderBook();
    await loadIndicators();
    await loadPrediction();
    await loadActivePredictions();
    await loadLiveBias();
    await loadstreaks();
    await loadProbability();
    await loadTradeStats();
    await loadLastTrades();
    await loadAccuracy();
    await loadOpenInterest();
    await loadFunding();
    await loadLiquidations();
    await loadChart();
}

refresh();

setInterval(refresh, 2000);
