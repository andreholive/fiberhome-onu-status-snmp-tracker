const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const snmp = require('./server_pack');
const {OLTs} = require('./data');
const Olt = require('./Olt');
const User = require('./User');


const Queue = require("promise-queue");
Queue.configure(require('vow').Promise);

var olts = {};
var users = {};



const app = express();
const server = http.createServer(app);
const sockets = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });


/* INICIO DO SISTEMA */

sockets.on('connection', (socket) => {
    var num = Object.keys(users).length;
    users[num] = new User({olts, socket});
    socket.emit('oltData', OLTs);
    
    socket.on('cliente', async (data) => {
        console.log(data)
        const res = await snmp.busca_cliente(data);
        socket.emit('cliente', res);
    });

    socket.on('findOnu', async (data) => {
        const onu = await olts[data.id_transmissor].findOnuByMac(data.onu_mac);
        const onuData = await onu.getOnuData();
        socket.emit('login', onuData);
    });

    socket.on('disconnect', () => {
        users[num].stopScan()
        delete users[num];
    })
})

server.listen(3001, async () => {  
    console.log(`Iniciando Servidor...`);
    // PRIMEIRA VERIFICAÇÃO DAS OLTS
    for(const olt of OLTs){
        if(olt.ativo == 1)
        {
            const obj = new Olt(olt);
            console.log(obj.options.idIxc)
            olts[obj.options.idIxc] = obj;
            obj.checkOnus();
        }
        
    }
    console.log(`Server Listening on port: 3001`);
})

