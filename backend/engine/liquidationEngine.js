let liquidation = {
    side: "NONE",
    quantity: 0,
    price: 0
};

function updateLiquidation(side, quantity, price) {

    liquidation = {
        side,
        quantity: Number(quantity),
        price: Number(price)
    };

}

function getLiquidation() {
    return liquidation;
}

module.exports = {
    updateLiquidation,
    getLiquidation
};
