const https = require("https");
const { updateOpenInterest } = require("../engine/openInterestEngine");

function fetchOpenInterest() {

    https.get(
        "https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT",
        (res) => {

            let data = "";

            res.on("data", chunk => {
                data += chunk;
            });

            res.on("end", () => {

                try {

                    const json = JSON.parse(data);

                    updateOpenInterest(json.openInterest);

                } catch (err) {

                    console.log("Open Interest Error:", err.message);

                }

            });

        }
    ).on("error", err => {

        console.log(err.message);

    });

}

function startOpenInterest() {

    fetchOpenInterest();

    setInterval(fetchOpenInterest, 10000);

}

module.exports = {
    startOpenInterest
};
