var users = []
var nextUser = -1

class MySocket {

    constructor(server){
        this.socket = require('socket.io')(server,{
            cors:{origin:"*"}
        })
    }

    generateId(socket){
        var id = Math.floor(Math.random() * 100)
        users.push(id)
        console.log("Users:",users)
        socket.emit('idGenerated', id)
    }

    disconnect(id){
        const index = users.indexOf(id);
        if (index > -1) {
            users.splice(index, 1);
            if( users.length == 0){
                nextUser = -1;
            }else{
                nextUser = nextUser%users.length;
            }
        }
    }

    async sendTranscationToUser(transactionDetails){    
        if( users.length == 0){
            return false
        }
        if(nextUser == -1){
            nextUser = 0;
        }

        this.message(users[nextUser],'messageFromServer',transactionDetails)

        nextUser = ++nextUser % users.length
        return true
    }

    message(userId, event, data) {
        this.socket.sockets.to(userId).emit(event, data)
    }
}


// -------------------------------------- module exports --------------------------------------
module.exports.MySocket = MySocket