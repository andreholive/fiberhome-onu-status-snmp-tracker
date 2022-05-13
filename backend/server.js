const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const snmp = require('./server_pack');
const {OLTs} = require('./data_teste');
const Olt = require('./Olt');
const User = require('./User');


const Queue = require("promise-queue");
Queue.configure(require('vow').Promise);

let olts = {};
let users = {};



const app = express();
const server = http.createServer(app);
const sockets = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

sockets.on('connection', (socket) => {
    var num = Object.keys(users).length;
    users[num] = new User({olts, socket});
    socket.emit('oltData', OLTs);
    
    socket.on('cliente', async (data) => {
        console.log(data)
        const res = await snmp.busca_cliente(data);
        socket.emit('cliente', res);
    });
    socket.on('updateLogin', async (data) => {
        const resp = await snmp.updateLogin(data);
        socket.emit('updateLogin', resp.data);
    });
    socket.on('disconnect', () => {
        users[num].stopScan()
        delete users[num];
    })
})

server.listen(3001, async () => {  
    console.log(`Iniciando Servidor...`);

    for(const olt of OLTs){
        if(olt.ativo == 1)
        {
            const obj = new Olt(olt);
            olts[obj.id] = obj;
            obj.checkOnus();
        }
        
    }
    console.log(`Server Listening on port: 3001`);
})

