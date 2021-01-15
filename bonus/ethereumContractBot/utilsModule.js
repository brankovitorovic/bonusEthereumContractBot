const https = require('https')

const CURRENT_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'

function getCurrentPrice() {
    return new Promise( (resolve, reject) => {
        https.get(CURRENT_PRICE_URL, (response) => { // sending get request to get price
            response.on('data', (data) => {
                var price = JSON.parse(data).ethereum.usd; // and we got the price
                resolve(price);
            })
        })
        .on("error", (err) => {
            console.log(currentTime() + ": Error with getting price: " + err.message);
            reject(err);
        });
    });
}

function getAveragePrice(prices,MINUTES_TO_WAIT){
    var add = 0;
    for(var i = 0; i < MINUTES_TO_WAIT; i++){
        add += prices[i]    
    }
    return add/MINUTES_TO_WAIT
}

function currentTime(){
    var today = new Date()
    var date = today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear()
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    return date + ' ' + time
}

// -------------------------------------- module exports --------------------------------------
module.exports.getCurrentPrice = getCurrentPrice
module.exports.getAveragePrice = getAveragePrice
module.exports.currentTime = currentTime