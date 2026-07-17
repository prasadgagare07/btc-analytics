let openInterest = 0;

function updateOpenInterest(value) {

    openInterest = Number(value);

}

function getOpenInterest() {

    return {
        openInterest
    };

}

module.exports = {
    updateOpenInterest,
    getOpenInterest
};
