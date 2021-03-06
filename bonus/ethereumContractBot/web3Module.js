// node js
const Web3 = require('web3')
const web3 = new Web3('https://kovan.infura.io/v3/2cd65820208443a6a034f10a6ec1d427')

// contract ( abi and contractAddress are copied from contract )
const abi = [{"inputs":[{"internalType":"uint256","name":"_ethPrice","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"getLastSetTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPrice","type":"uint256"}],"name":"setEthPrice","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const contractAddress = '0xeB23AB1b43B414e15430aA9a33A7915aA81A2268';
const contract = new web3.eth.Contract(abi, contractAddress);

const MINUTES_TO_WAIT = 15;

// -------------------------------------- transaction --------------------------------------

async function getTransactionDetails(average){
    var gasPrice = await web3.eth.getGasPrice()
    var gasNeeded = await getGasNeeded(average)
    var data = contract.methods.setEthPrice( web3.utils.toWei(average+'') ).encodeABI()
    return {contractAddress: contractAddress, average: data, gasPrice: gasPrice, gasNeeded:gasNeeded}
}

async function getGasNeeded(average){
    var promiseForGas = contract.methods.setEthPrice( web3.utils.toWei(average+'') ).estimateGas()
    return await promiseForGas
} 

// -------------------------------------- timestamp --------------------------------------

function isTimestampPassed(){
    return new Promise( (resolve, reject) => {
        var promiseForTimestamp = contract.methods.getLastSetTimestamp().call()
        promiseForTimestamp
            .then( timestamp => {
                if( is15MinPass(timestamp) ){
                    resolve(true)
                }
                else{
                    reject(minutesToTimeout(timestamp))
                }
            })
            .catch( err => console.log(err))
    })
}

function is15MinPass(timestamp){ 
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp - timestamp > MINUTES_TO_WAIT * 60;
}

function minutesToTimeout(timestamp){
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return MINUTES_TO_WAIT - Math.floor((currentTimestamp - timestamp)/60)
}

// -------------------------------------- price --------------------------------------

async function isPriceChanged2Percent(average){
    try{
        var price = await getPriceFromContract()
    }catch( err ){
        return err;
    }
    return new Promise( (resolve,reject) => {
        try{
            if( isPriceChangedEnough(average,price) ) {
                resolve(true)
            }
            else{
                reject(false)
            }
        }catch( err ){
            reject(err)
        }
    })
}

function isPriceChangedEnough(average, price){
    if(average > price * 1.02 || average < price * 0.98){
        return true
    }
    return false
}

function getPriceFromContract(){
    return new Promise( (resolve, reject) => {
        contract.methods.getPrice().call()
            .then( price => {
                let priceInDollars = web3.utils.fromWei(price, "ether" )
                resolve(priceInDollars)
            })
            .catch( err => reject(err))
    })
}

// -------------------------------------- module exports --------------------------------------
module.exports.isTimestampPassed = isTimestampPassed
module.exports.isPriceChanged2Percent = isPriceChanged2Percent
module.exports.getPriceFromContract = getPriceFromContract
module.exports.getTransactionDetails = getTransactionDetails

