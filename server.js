const express = require("express")
const app = express()
const server = require('http').Server(app)
//deal cors
const socketIO = require("socket.io")(server,{
    cors: {
        origin: '*'
    }
})
// const socketIO = require("socket.io")(server)
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

const rooms = {}
app.get('/',(req, res)=>{
    res.render('index', {rooms: rooms})
})

app.get('/:room', (req,res)=>{
    //if a room user trying to enter doesn't exist, redirect the user to homepage
    if(rooms[req.params.room] == null){
       return res.redirect('/')
    }
    //otherwise, render the room page
    res.render('room', {roomName: req.params.room})
})
server.listen(3000)
//create a room
app.post('/room', (req, res)=>{
    //if the room has been created
    if(rooms[req.body.room]!= null){
        //redirect the user to the main page
        return res.redirect('/')
    }
    //otherwise set the room and redirect the user to the new room
    rooms[req.body.room] = {users: {}}
    res.redirect(req.body.room)
    //send message that the room has created
    socketIO.emit("room-created", req.body.room)
})

socketIO.on('connection',socket =>{
    // socket.emit('chat-message', "Hi myboy")
    socket.on('new-user', (room, name) =>{
        //set name
        socket.join(room)
        rooms[room].users[socket.id] = name
        //broadcast to every client in the room except the sender
        socket.to(room).emit('user-connected', name)
    })
    socket.on('send-chat-message', (room, message)=>{
        //only gonna send the message to this room passed in
        socket.to(room).emit('chat-message', {message: message, name: rooms[room].users[socket.id]})
    })
    socket.on('disconnect', () =>{
        getUserRooms(socket).forEach(room =>{
            socket.to(room).emit('user-disconnected', rooms[room].users[socket.id])
            delete rooms[room].users[socket.id]
        })
        
    })
})
function getUserRooms(socket){
//start from empty array, each iteration we push a name that represent a room where users are a part of
// to the names object
    return Object.entries(rooms).reduce((names, [name, room]) =>{
        if(room.users[socket.id] != null) names.push(name)
        return names
    },[])
}

