const geckos = require('@geckos.io/server').default
const http = require('http')
const server = http.createServer({})
const io = geckos()

io.addServer(server)
// make sure the client uses the same port
// @geckos.io/client uses the port 9208 by default
server.listen(9208, "0.0.0.0")

const players = new Array(32)
let playerId = 0



const addPlayer = (channel) => {
    let id = playerId++
    players[id] = ({channel, id})
    console.log(`Total Connections: ${playerId}`);
    console.log(`${id} Joined. Total Connections: ${players.reduce((memo, p) => {
        p && memo++
        return memo
    }, 0)}`);
    return id
}

const removePlayer = (id) => {
    players[id] = null
    console.log(`${id} left. Total Connections: ${players.reduce((memo, p) => {
        p && memo++
        return memo
    }, 0)}`);
}

const processPlayerMessage = (id, data) => {
    players.filter(p => p).forEach(p => {
        if (p.id !== id) {
            data = new Int16Array(data)
            let x = new Int16Array(4);
            x[0] = id
            x[1] = data[0];
            x[2] = data[1];
            x[3] = data[2];
            p.channel.raw.emit(x)
        }
    })
}

        
io.onConnection(channel => {
    let id = addPlayer(channel)
    channel.onDisconnect(() => {
        removePlayer(id)
    })
    channel.on('play', evt => {
        let username = evt.username
        
        if (!players.filter(p => p).some(p => {
            return p.username == username
        })) {
            players[id].username = username
            channel.emit('play', {
                id,
                players: players.filter(p => {
                    return p && p.id !== id
                }).map(p => ({id: p.id, username: p.username}))
            }, {reliable: true, runs: 5, interval: 200})
            players.filter(p => p).forEach(p => {
                if (p.channel) {
    
                    p.channel.emit('newPlayer', {id, username}, {reliable: true, runs: 5, interval: 200})
                }
                })
        } else {
            channel.emit('play', {id: null})
        }
    })
    channel.onRaw(data => {
        processPlayerMessage(id, data)
    })
})

let working = false
setInterval(() => {
    // if (players[0] && !working) {
    //     working = true
    //     let x = 10000
    //     while (x--) {
    //         players[0].channel.raw.emit(new Uint32Array(300))
    //     }
    //     players[0].channel.close()
    //     players[0] = null
    //     playerId--
    // }
}, 1000)