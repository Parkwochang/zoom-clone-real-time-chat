import http from "http";
import SocketIO from "socket.io";
// import WebSocket,{WebSocketServer} from "ws";
import express from "express";

const app = express();

app.set('view engine', "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_,res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

io.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(`socket Event: ${event}`);
  })
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});


// use websocket

// const wss = new WebSocketServer({server});

// function onSocketClose() {
//   console.log("Disconnected from the Browser ❌");
// }

// const sockets= [];

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous";
//   console.log("Connet to Browser ✅");
//   socket.on("close", onSocketClose);
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch(message.type) {
//       case "new_message" :
//         sockets.forEach((aSocket) => 
//           aSocket.send(`${socket.nickname}: ${message.payload}`));
//       case "nickname" :
//         socket["nickname"] = message.payload;
//     }
//   });
// });

httpServer.listen(3000,handleListen);