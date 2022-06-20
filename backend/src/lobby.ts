import { Server } from "socket.io";
import {Olt} from './Olt';
import { Onu } from "./Onu";
import {User} from "./User";
const {OLTs} = require('./data');
const snmp = require('./server_pack');

interface Message{
    type: string;
    data: any
}
export interface Lobby{
    sockets: Server;
    olts: Olt[];
    users: User[];
}

export class Lobby{
    sockets: Server;
    olts: Olt[];
    users: User[];

    constructor(sockets:Server){
        this.sockets = sockets;
        this.olts = [];
        this.users = [];
    }

    async startLobby(){
        await this.updateOlts();
        this.startSocket();
    }

    sendMsgToUser = (user:User,msg:Message) => {
        user.emitMessage({type: msg.type, data: msg.data})
    }

    findOnuByMac(mac:any):Onu | undefined{
        let onu:Onu;
        for(const olt of Object.values(this.olts)){
            onu = olt.findOnuByMac(mac);
            return onu;
        }
        return undefined;
    }

    updateOlts = async (i = 0) =>{
        if(OLTs && i < OLTs.length && OLTs[i].ativo == 1){
            const obj = OLTs[i];
            this.olts[obj.options.idIxc] = new Olt(obj);
            await this.olts[obj.options.idIxc].getAuthorizedOnus();
            await this.updateOlts(i+1);
        }
    }

    startSocket = () => {
        this.sockets.on('connection', (socket:any) => { 
            console.log('User '+socket.conn.id+' connected')
            const user = this.insertUser(socket);
            socket.on('startScan', async (num:number) => { 
                num != -1 ? user.startScan(this.olts[num]) : user.stopScan();
            });
    
            socket.on('caixa', async (caixa:any) => {
                const data = await snmp.busca_caixa(caixa, this.olts);
                this.sendMsgToUser(user, {type:'caixa', data});
            });
    
            socket.on('updatePorta', async (login:any) => {
                const onu = this.findOnuByMac(login.onu_mac);
                if(onu){
                    const resp = await onu.updatePorta(login);
                    console.log(resp);
                }
            });

            socket.on('cliente', async (data:any) => {
                console.log(data)
                const res = await snmp.busca_cliente(data);
                socket.emit('cliente', res);
            });

            socket.on('disconnect', () => this.removeUser(socket));
        }
        
        );
    }

    getUser(id: number): User{
        return this.users[id];
    }

    insertUser = (socket:any) => {
        const user = this.users[socket.conn.id] = (new User({olts: this.olts, socket}));
        this.sendMsgToUser(user, {type:'oltData', data:OLTs});
        return user;
    }

    removeUser = (socket:any) => {
        this.users[socket.conn.id].stopScan();
        delete this.users[socket.conn.id];
    }
    
}