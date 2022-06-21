import { Server } from "socket.io";
import {Olt} from './Olt';
import { Onu } from "./Onu";
import {User} from "./User";
import {OLTs} from '../OltsData';
import { IxcApi } from "../services/ixcApi";
const api = new IxcApi();

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
        await this.getOnusInOlts();
        this.startSocket();
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

    sendMsgToUser = (user:User,msg:Message) => {
        user.emitMessage({type: msg.type, data: msg.data})
    }

    findOnuByMacInOlts(mac:any):Onu | undefined{
        let onu:Onu;
        for(const olt of Object.values(this.olts)){
            onu = olt.findOnuByMac(mac);
            return onu;
        }
        return undefined;
    }

    getOnusInOlts = async (i = 0) =>{
        if(OLTs && i < OLTs.length && OLTs[i].ativo == 1){
            const obj = OLTs[i];
            this.olts[obj.options.idIxc] = new Olt(obj);
            await this.olts[obj.options.idIxc].getAuthorizedOnus();
            await this.getOnusInOlts(i+1);
        }
    }

    async searchClient(name: string){
        const clientList = await api.findClientsByName(name);
        await api.getLoginsToClientsList(clientList);
        return clientList;
    }

    async findOnusByLoginList(loginList:any[]):Promise<Onu[]>{
        let onus: Onu[] = [];
        const exec = async (i:number) =>{
            if(loginList && i < loginList.length){
                const onu = this.findOnuByMacInOlts(loginList[i].onu_mac);
                if(onu){
                    await onu.updateAllOnuDataFromServer();
                    onus.push(onu);
                }
                await exec(i+1);
            }
        }
        await exec(0);
        return onus;
    }

    async searchCaixa(description:string){
        const caixa = await api.searchCaixa(description);
        const ctoLogins = await api.getLoginsByCTO(caixa.id);
        const onuList = await this.findOnusByLoginList(ctoLogins);
        const onus = onuList.map(onu => onu.getOnuToSend());
        return {caixa, onus}
    }

    startSocket = () => {

        this.sockets.on('connection', (socket:any) => { 
            
            const user = this.insertUser(socket);
            console.log('User '+socket.conn.id+' connected');

            socket.on('startScan', async (num:number) => { 
                num != -1 ? user.startScan(this.olts[num]) : user.stopScan();
            });
    
            socket.on('caixa', async (caixa:string) => {
                const data = await this.searchCaixa(caixa);
                this.sendMsgToUser(user, {type:'caixa', data});
            });
    
            socket.on('updatePorta', async (login:any) => {
                const onu = this.findOnuByMacInOlts(login.onu_mac);
                if(onu){
                    await onu.updatePorta(login);
                }
            });

            socket.on('cliente', async (name:any) => {
                const clientList = await this.searchClient(name);
                socket.emit('cliente', clientList);
            });

            socket.on('disconnect', () => this.removeUser(socket));
        }
        
        );
    }
    
}