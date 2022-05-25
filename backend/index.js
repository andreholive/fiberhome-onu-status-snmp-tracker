const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Lobby = require('./lobby');

const app = express();
const server = http.createServer(app);
const sockets = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

server.listen(3001, async () => {  
    console.log(`Iniciando Servidor...`);
    const lobby = new Lobby(sockets);
    lobby.startServer();   
    console.log(`Server Listening on port: 3001`);
})