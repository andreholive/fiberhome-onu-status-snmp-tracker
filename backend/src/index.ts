import express from "express";
import { createServer } from 'http';
import { Server } from "socket.io";
import {Lobby} from "./lobby"

const app = express();
const server = createServer(app);
const sockets = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

server.listen(3001, async () => { 
    console.log(`Iniciando Servidor...`);
    const lobby = new Lobby(sockets);
    lobby.startLobby();   
    console.log(`Server Listening on port: 3001`);
    
})