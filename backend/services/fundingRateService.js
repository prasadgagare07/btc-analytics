const https = require("https");
const marketState = require("../data/marketState");
const { updateFundingRate } = require("../engine/fundingRateEngine");

function fetchFundingRate() {

    https.get(
        "https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT",
        (res) => {

            let data = "";

            res.on("data", chunk => {
                data += chunk;
            });

            res.on("end", () => {

                try {

                    const json = JSON.parse(data);

                    updateFundingRate(json.lastFundingRate);
                    marketState.fundingRate = Number(json.lastFundingRate);

                } catch (err) {

                    console.log("Funding Rate Error:", err.message);

                }

            });

        }
    ).on("error", err => {
        console.log(err.message);
    });

}

function startFundingRate() {

    fetchFundingRate();

    setInterval(fetchFundingRate, 10000);

}

module.exports = {
    startFundingRate
};
