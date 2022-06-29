import { Socket } from "socket.io";

export interface Message{
    type: string;
    data: any
}

export class User{
    private _id: string;
    private _socket: Socket;
    private _oltScan: number = -1;
    constructor(socket:any){
        this._id = socket?.conn.id ;
        this._socket = socket || null;
    }

    public get id(){
        return this._id;
    }

    public get socket(){
        return this._socket
    }

    public get oltScan():number{
        return this._oltScan;
    }

    public set oltScan(oltNum:number){
        this._oltScan = oltNum
    }

    public isConnected(){
        return this.socket.connected;
    }

}