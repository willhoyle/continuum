import geckos from '@geckos.io/server'

const io = geckos()

io.listen(9208) // default port is 9208

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