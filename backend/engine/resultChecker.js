async function checkResults(db, marketState) {

    const now = Date.now();

    const pending = await db.query(
        `
        SELECT *
        FROM candle_predictions
        WHERE result='PENDING'
        AND expiry_time <= $1
        `,
        [now]
    );

    for (const row of pending.rows) {

        let result = "LOSS";

        if (
            row.signal === "BUY" &&
            marketState.lastPrice > row.open_price
        ) {
            result = "WIN";
        }

        if (
            row.signal === "SELL" &&
            marketState.lastPrice < row.open_price
        ) {
            result = "WIN";
        }

        await db.query(
            `
            UPDATE candle_predictions
            SET
                close_price=$1,
                result=$2
            WHERE id=$3
            `,
            [
                marketState.lastPrice,
                result,
                row.id
            ]
        );

        console.log(
            "Prediction",
            row.id,
            result
        );
    }

}

module.exports = {
    checkResults
};
