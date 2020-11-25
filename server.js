const geckos = require('@geckos.io/server').default
const http = require('http')
const server = http.createServer({})
const io = geckos()

io.addServer(server)
// make sure the client uses the same port
// @geckos.io/client uses the port 9208 by default
server.listen(9208, "0.0.0.0")

const connections = []

io.onConnection(channel => {
    console.log(`got a a new connection: ${channel.id}`);
    connections.push(channel)
    channel.onDisconnect(() => {
        console.log(`${channel.id} got disconnected`)
    })

    channel.onRaw(data => {
        connections.forEach(c => {
            console.log(c.id, channel.id);
            if (c.id !== channel.id) {
                c.raw.emit(data)
            }
        })
    })
})
