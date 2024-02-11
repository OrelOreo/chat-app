const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const { generateMessage, generateLocationMessage } = require('./utils/message')
const { isRealString } = require('./utils/isRealString')
const { Users } = require('./utils/users')

const publicPath = path.join(__dirname, '/../public')
const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketIO(server)
const users = new Users()

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room are required')
        }
        socket.join(params.room)
        users.removeUser(socket.id)
        users.addUser(socket.id, params.name, params.room)

        io.to(params.room).emit('updateUsersList', users.getUserList(params.room))

        socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room}`))
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', "new user joined !"))
        callback()
    })

    socket.on('createMessage', (message, callback) => {
        const user = users.getUser(socket.id)
        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text))
        }
        
        callback(`This is the server:`)
    })

    socket.on('createLocationMessage', (coords) => {
        const user = users.getUser(socket.id)
        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.lat, coords.lng))
        }
    })

    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('updateUsersList', users.getUserList(user.room))
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the ${user.room} chat room`))
        }
    })
})

server.listen(port, () => console.log(`Server is up on port ${port}`))
