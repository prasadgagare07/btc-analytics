
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

loadStatus();
loadMarket();
loadIndicators();

setInterval(() => {

    loadStatus();
    loadMarket();
    loadIndicators();

}, 2000);
