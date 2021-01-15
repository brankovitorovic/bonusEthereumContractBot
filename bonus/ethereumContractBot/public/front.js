var id = 0;
var socket = {};

styleDisplay('disconnect','none')

function connect(){
  
  if (typeof web3 !== 'undefined') {
    this.web3Provider = web3.currentProvider
    web3 = new Web3(web3.currentProvider)
  } else {
    window.alert("Please connect to Metamask.")
    return;
  }
  
  socket = io('ws://localhost:3000')

  socket.on('idGenerated', generatedId => {
    id = generatedId 
    socket.emit('addToQueue', id)
  })
  
  socket.on('messageFromServer', data => {
      tryToCharge(data)
  })
  
  styleDisplay('disconnect','inline')
  styleDisplay('connect','none')

}

function tryToCharge(data){
  accountAddress = web3.eth.accounts[0] 

  web3.eth.sendTransaction({
    from: accountAddress,
    to: data.contractAddress,
    data: data.average,
    gasPrice: data.gasPrice,
    gas: data.gasNeeded
  }, res => {
    console.log(res)
  })

}

function disconnect(){
  socket.emit('tryToDisconnect', id)
  socket.emit('userDisconnected', id)

  styleDisplay('disconnect','none')
  styleDisplay('connect','inline')
}

function getUsers(){
  axios.get('/getUsers')
    .then( res => console.log(res))
}

function styleDisplay(id,display){
  document.getElementById(id).style.display = display
}
