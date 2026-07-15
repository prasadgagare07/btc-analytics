require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { connectBinance } = require("./websocket/binanceSocket");

const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// API Health Check
app.get("/api/status", (req, res) => {
    res.json({
        status: "Running",
        service: "BTC Analytics",
        time: new Date()
    });
});

// Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

connectBinance();

app.listen(PORT, () => {
    console.log("==================================");
    console.log("BTC Analytics Server Started");
    console.log("Port:", PORT);
    console.log("==================================");
});
