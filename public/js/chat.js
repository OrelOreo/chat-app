const submitFormBtn = document
  .querySelector("#submit-btn")
  .addEventListener("click", submit);
const sendLocationBtn = document
  .querySelector("#send-location")
  .addEventListener("click", sendLocation);
const messages = document.querySelector("#messages");
const inputMessage = document.querySelector('input[name="message"]');
const socket = io();

function scrollToBottom() {
  messages.lastElementChild.scrollIntoView();
}

async function sendLocation() {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    if (!position) {
      return alert("Unable to fetch your location.");
    }
    socket.emit("createLocationMessage", {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
  });
}

async function submit(e) {
  e.preventDefault();
  socket.emit(
    "createMessage",
    {
      text: inputMessage.value,
    },
    () => {
      inputMessage.value = "";
    }
  );
}

socket.on("connect", () => {
  let searchQuery = window.location.search.substring(1);
  let params = JSON.parse(
    '{"' +
      decodeURI(searchQuery)
        .replace(/&/g, '","')
        .replace(/\+/g, " ")
        .replace(/=/g, '":"') +
      '"}'
  );
  socket.emit("join", params, (error) =>  {
    if (error) {
       alert(error)
       return window.location.href = '/'
    }
    console.log('No Error')
  })
  console.log("Connected to server.");
});

socket.on('updateUsersList', (users) => {
  const ol = document.createElement('ol')
  users.forEach((user) => {
    let li = document.createElement('li')
    li.innerText = user
    ol.appendChild(li)
  })
  const usersList = document.querySelector('#users')
  usersList.innerText = ""
  usersList.appendChild(ol)
})

socket.on("newMessage", (message) => {
  const formattedTime = moment(message.createdAt).format("LT");
  const template = document.querySelector("#message-template").innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formattedTime,
  });
  const div = document.createElement("div");
  div.innerHTML = html;
  messages.appendChild(div);
  scrollToBottom();
});

socket.on("newLocationMessage", (message) => {
  const formattedTime = moment(message.createdAt).format("LT");
  const template = document.querySelector(
    "#location-message-template"
  ).innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime,
  });
  const div = document.createElement("div");
  div.innerHTML = html;
  messages.appendChild(div);
  scrollToBottom();
});

socket.on("disconnect", () => console.log("Disconnect to server."));
