const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.querySelector("#room");

const changeName = room.querySelector("#change_name");
const changeRoom = room.querySelector("#change_room");

room.hidden = true;

let roomName;

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, ()=> {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function changeNickname(event) {
  changeName.hidden = true;
  room.querySelector("#name").hidden = false;
  socket.emit("change_nickname","Anon");
}
function chatReload() {
  window.location.reload();
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  const value = input.value;
  socket.emit("nickname", input.value);
  input.value = "";
  room.querySelector("#name").hidden = true;
  changeName.hidden = false;
  changeRoom.hidden = false;
  changeName.addEventListener("click",changeNickname);
  changeRoom.addEventListener("click", chatReload);
}

function showRoom(newCount) {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `${roomName} Room (${newCount})`;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  changeName.hidden = true;
  changeRoom.hidden = true;
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = ""

}
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} joined`);
});

socket.on("bye", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} left`);
})

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if(rooms.length === 0) {
    return;
  }
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});