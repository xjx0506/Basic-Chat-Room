const socket = io('http://localhost:3000')
const messageContainer = document.getElementById("message_container")
const messageForm = document.getElementById("send_container")
const messageInput = document.getElementById("message_input")
const roomContainer = document.getElementById("room_container")

if(messageForm != null){
    const username = prompt("What's you name?")
    appendMsg('You joined')
    //send the username and roomName to server
    socket.emit('new-user',roomName, username)
    
    messageForm.addEventListener('submit', (e)=>{
        e.preventDefault()
        const message = messageInput.value
        //send chat message to the server
        appendMsg(`You: ${message}`)
        socket.emit('send-chat-message',roomName, message)
        //after sending the information, reset the 聊天框 to empty
        messageInput.value= ''
    })

}
//on receiving the user-connected response from server
socket.on('user-connected', name =>{
    // console.log(data);
    appendMsg(`${name} connected`)
})
//after receiving chat message from server
socket.on('chat-message', data =>{
    // console.log(data);
    appendMsg(`${data.name}: ${data.message}`)
})
//if a user disconnect
socket.on('user-disconnected', name =>{
    appendMsg(`${name} disconnected`)
})

socket.on('room-created', room =>{
    //handle the room created response
    const roomElement = document.createElement('div')
    roomElement.innerText = room
    const roomLink = document.createElement('a')
    roomLink.href = `/${room}`
    roomLink.innerText = 'Join'
    roomContainer.append(roomElement)
    roomContainer.append(roomLink)

})
function appendMsg(message){
   const messageElement = document.createElement('div')
   messageElement.innerText = message
   messageContainer.append(messageElement)
}