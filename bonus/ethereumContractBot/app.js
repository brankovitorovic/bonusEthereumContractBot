const express = require('express')
const app = express();
const taskModule = require('./taskModule')
const utilsModule = require('./utilsModule')

const PORT = 3000

app.use(express.static("public"))
app.use(express.json())

app.get('/get-price', (req, res) => {
    Promise.all([utilsModule.getCurrentPrice(),taskModule.getPriceFromContract()])
        .then( array => {
            var data = {
                'currentPrice':array[0],
                'contractPrice':array[1]
            }
            res.type('json')
            res.send(data)
        })
        .catch( err => {
            return err;
        })
})

var server = app.listen(PORT, startTask);

function startTask(){
    taskModule.startTask(server)
}



