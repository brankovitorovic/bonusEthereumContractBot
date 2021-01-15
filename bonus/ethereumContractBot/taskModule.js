const web3Module = require('./web3Module')
const utilsModule = require('./utilsModule')
const socketModule = require('./socketModule')

const MINUTES_TO_WAIT = 15
const MINUTES_TO_CHECK = 1

var is15minPassed = false

var prices = []
var cntForPrices = 0

function startTask(server){

    initSocket(server)

    timeoutForContractCheck(MINUTES_TO_WAIT)
    setInterval(task, MINUTES_TO_CHECK * 1000 * 60); // in miliseconds ( to get 1 minute, 1000 * 60)
}

// To prevent calling smart contract first 15 minutes after server starts ( no need for that ), 
// 15 minutes after every contract write
// and n minutes to wait after last write contract ( if someone else write it )
function timeoutForContractCheck(minutes){ 
    is15minPassed = false;
    setTimeout( () => {
        is15minPassed = true; 
    }, minutes * 60 * 1000)
}

async function task(){
    try{
        var price = await utilsModule.getCurrentPrice()
    }catch(err){
        console.log(utilsModule.currentTime() + ': Error with getting price: ' + err)
        return err
    }
    addCurrentPrice(price)
    if( is15minPassed ){
        if( await isContractTimestampPassed() ){
            if( await isPriceChanged2Pct() ){
                try{
                    if ( await mySocket.sendTranscationToUser(await getTransactionDetails()) ){
                        timeoutForContractCheck(MINUTES_TO_WAIT)
                    }else{
                        console.log(utilsModule.currentTime() + ': No user to pay gas.')
                    }
                }catch(err){
                    console.log(utilsModule.currentTime() + ': Error with finishing transaction:' + err)
                }
            }else {
                console.log(utilsModule.currentTime() + ': Price is not changed enough.')
            } 
        }else{
            console.log(utilsModule.currentTime() + ': Not enough time has passed.')
        }
        
    }
}

function addCurrentPrice(price){ // add new price to array every minute
    prices[cntForPrices] = price;
    cntForPrices = ++cntForPrices % 15; // to use only 15 spaces in array
}

// -------------------------------------- socket --------------------------------------

function initSocket(server){
    mySocket = new socketModule.MySocket(server)
    mySocket.socket.on('connection', socket => {
        mySocket.generateId(socket)
    })
    mySocket.socket.on('connect', function (socket) {
        socket.on('addToQueue', socket.join)
        socket.on('userDisconnected', socket.leave)
        socket.on('tryToDisconnect', id => mySocket.disconnect(id))
    })
}

// -------------------------------------- web3 --------------------------------------

async function isContractTimestampPassed(){
    try{
        return await web3Module.isTimestampPassed()
    }catch(minutes){
        console.log(utilsModule.currentTime() + ': Error with timestamp, ' + minutes + ' more minutes to wait before next check to write contract.')
        timeoutForContractCheck(minutes)
        return false
    }
}

async function isPriceChanged2Pct(){
    try {
        return await web3Module.isPriceChanged2Percent(utilsModule.getAveragePrice(prices,MINUTES_TO_WAIT))
    }catch(err){
        console.log(utilsModule.currentTime() + ': Error with price:' + err)
        return false
    }
}

async function getTransactionDetails(){
    return await web3Module.getTransactionDetails(utilsModule.getAveragePrice(prices,MINUTES_TO_WAIT))
}

async function getPriceFromContract(){
    return await web3Module.getPriceFromContract();
}

// -------------------------------------- module exports --------------------------------------
module.exports.startTask = startTask
module.exports.getPriceFromContract = getPriceFromContract
