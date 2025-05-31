const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require('mongoose');

const PORT=process.env.PORT || 3000;

const app = express();
let code = "";
const usersInRoom = {};
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://codecollab-frontend-kgxh.onrender.com", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

/* 
mongoose.connect('mongodb+srv://santoshhadiya:Santosh123@codecolab.k5i311x.mongodb.net/?retryWrites=true&w=majority&appName=codecolab')
.then(() => console.log('✅ MongoDB Atlas connected'))
.catch(err => console.error('Connection error:', err));
 */

io.on("connection", (socket) => {
  socket.on("sendCode", (data) => {
    if (!socket.room) return;
    code = data.code;
    socket.to(socket.room).emit("sendCode", { code: data.code });
  });

  socket.on("handleUser", (data) => {
    const newUSerName = data.user;
    socket.userName = newUSerName;
    io.to(socket.room).emit("handleUser", { newUser: socket.userName });
  });

  socket.on("handleRoom", (data) => {
    const room = data.room;

    socket.join(room);
    socket.room = room;

    if (!usersInRoom[room]) usersInRoom[room] = [];
    usersInRoom[room].push({ userName: socket.userName, socketId: socket.id });

    io.to(room).emit("handleRoom", { userName: socket.userName, room, code });
    io.to(room).emit("updateUserList", usersInRoom[room]);
  });

  socket.on("leaveRoom", (data) => {
    const room = data.room;
    socket.leave(room);

    if (usersInRoom[room]) {
      usersInRoom[room] = usersInRoom[room].filter(
        (user) => user.socketId !== socket.id
      );
    }

    io.to(room).emit("leaveRoom", { room, userName: data.user });

    io.to(room).emit("updateUserList", usersInRoom[room]);

    if (socket.room === room) {
      socket.room = null;
    }
  });

  socket.on('userTyping', (data)=>{
    io.to(socket.room).emit('userTyping', {userName:data.user});
  })

  socket.on("disconnect", () => {
    const room = socket.room;
    if (room && usersInRoom[room]) {
      usersInRoom[room] = usersInRoom[room].filter(
        (user) => user.socketId !== socket.id
      );
      io.to(room).emit("updateUserList", usersInRoom[room]);
    }

    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log("server running at port 3000");
});
