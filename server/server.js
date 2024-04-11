const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: true,
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, peerId, streamID) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', peerId)

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', peerId, streamID)
        })
    })
})

server.listen(5000, () => console.log('server is running on port 5000'))