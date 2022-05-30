import socketIOClient from 'socket.io-client';
const localhost = 'http://localhost:3001';

function startSocket(){
    const socket = socketIOClient(localhost, {
        reconnectionAttempts: 5,
    });
    return socket;
    
}

export default startSocket;