import { Socket } from "socket.io";
import { Olt } from "./Olt";

interface Message{
    type: string;
    data: any
}

export interface User {
    id: string;
    socket: Socket;
    oltScan: Olt;
}

export class User{
    constructor(data:any){
        this.id = data.socket.conn.id;
        this.socket = data.socket;
    }

    emitMessage = (msg:Message) => {
        this.socket.emit(msg.type, msg.data)
    }

    startScan(olt: Olt){
        this.oltScan = olt;
        console.log('User '+this.id+' INICIOU scan na Olt de '+ this.oltScan.cidade);
        olt.startScan(this);
    }

    stopScan(){
        if(this.oltScan.isScanning()){
            console.log('User '+this.id+' PAROU scan na Olt de '+this.oltScan.cidade);
            this.oltScan.stopScan(this);
        }
        
    }
}