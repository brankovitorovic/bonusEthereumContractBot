
function startConstantPriceCheck(){  // start checking for price every minute
    timeoutForContractCheck(MINUTES_TO_WAIT)
    setInterval(doServerTask, MINUTES_TO_CHECK * 1000 * 60); // in miliseconds ( to get 1 minute, 1000 * 60)
}




// -------------------------------------- module exports --------------------------------------
module.exports.startTask = startTask