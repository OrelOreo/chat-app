const submitFormBtn = document.querySelector('#submit-btn').addEventListener('click', submit)
const sendLocationBtn = document.querySelector('#send-location').addEventListener('click', sendLocation)
const socket = io()

async function sendLocation() {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        if (!position) {
            return alert('Unable to fetch your location.')
        }
        socket.emit('createLocationMessage', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        })
    })
}

async function submit(e) {
    e.preventDefault()
    socket.emit("createMessage", {
        from: 'User',
        text: document.querySelector('input[name="message"]').value
    })
}

// Built-in event listeners
socket.on('connect', () => {
    console.log('Connected to server.')
})

socket.on('newMessage', (message) =>  {
    const formattedTime = moment(message.createdAt).format('LT')
    let li = document.createElement('li')
    li.innerText = `${message.from}: ${formattedTime} ${message.text}`
    document.body.appendChild(li)
})

socket.on('newLocationMessage', (message) =>  {
    const formattedTime = moment(message.createdAt).format('LT')
    let li = document.createElement('li')
    let a = document.createElement('a')
    li.innerText = `${message.from}: ${formattedTime} `
    a.setAttribute('target', '_blank')
    a.setAttribute('href', message.url)
    a.innerText = "My current location"
    document.body.appendChild(li)
    li.appendChild(a)
})


socket.on('disconnect', () => console.log('Disconnect to server.'))