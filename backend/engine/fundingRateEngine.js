let fundingRate = 0;

function updateFundingRate(value) {
    fundingRate = Number(value);
}

function getFundingRate() {
    return {
        fundingRate
    };
}

module.exports = {
    updateFundingRate,
    getFundingRate
};
