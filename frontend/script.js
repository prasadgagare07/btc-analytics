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
        //alert(JSON.stringify(data));

        document.getElementById("signal").textContent = data.signal || "-";
        document.getElementById("confidence").textContent = (data.confidence ?? 0) + "%";
        document.getElementById("entry").textContent = data.entry || "-";
        document.getElementById("target").innerHTML = data.target;
        //document.getElementById("sl").textContent = data.sl || "-";
        //document.getElementById("tp").textContent = data.tp || "-";
        document.getElementById("target").innerHTML = data.target;
        document.getElementById("reasons").textContent =
        data.reasons ? data.reasons.join(", ") : "-";
        document.getElementById("tradeDuration").textContent =
        data.tradeDuration || "-";
        
    } catch (err) {

        console.log(err);
        alert(err.message);

    }

}

async function loadActivePredictions() {

    try {

        const res =
    await fetch("/api/candle-history");
        const predictions = await res.json();
        
        const now = Date.now();

        const activePredictions = predictions
    .filter(p => p.result === "PENDING")
    .sort((a, b) => Number(b.prediction_time) - Number(a.prediction_time));

        let html = "";

        activePredictions.slice(0, 2).forEach(p => {

            const predictionTime =
                new Date(Number(p.prediction_time))
                .toLocaleTimeString();

            const expiryTime =
                new Date(Number(p.expiry_time))
                .toLocaleTimeString();

            html += `

            <div style="margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid #444;">

                <p><b>Signal:</b> ${p.signal}</p>

                <p><b>Confidence:</b> ${p.confidence}%</p>

                <p><b>Prediction:</b> ${predictionTime}</p>

                <p><b>Expiry:</b> ${expiryTime}</p>

                <p><b>Status:</b> ${p.result}</p>

                <p><b>Remaining:</b>
                <span id="timer-${p.id}"></span>
                </p>

            </div>

            `;

        });

        if (activePredictions.length === 0) {
    html = "No active predictions";
}

document.getElementById("activePredictions").innerHTML = html;

activePredictions.forEach(p => {
    startPredictionTimer(
        p.id,
        Number(p.expiry_time)
    );
});

} catch (err) {
    console.log(err);
}
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
        //alert(err.message);

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
        //alert(err.message);

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
        //alert(err.message);

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
    await loadAccuracy();
    await loadOpenInterest();
    await loadFunding();
    await loadLiquidations();
    await loadChart();
}

refresh();

setInterval(refresh, 2000);
