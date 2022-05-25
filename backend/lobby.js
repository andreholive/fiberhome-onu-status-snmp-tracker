const User = require('./User');
const Olt = require('./Olt');
const {OLTs} = require('./data');
const snmp = require('./server_pack');

module.exports = class Lobby{
    constructor(sockets){
        this.sockets = sockets;
        this.olts = []
        this.users = [];
    }

    async startServer(){
        await this.updateOlts(0);
        this.startSocket();
    }

    sendMsgToUser = (user,msg) => {
        user.socket.emit(msg.type, msg.data)
    }

    findOnuByMac(mac){
        for(const olt of Object.values(this.olts)){
            const onu = olt.findOnuByMac(mac);
            if(onu != -1){
                return onu;
            }
        }
    }

    updateOlts = async i =>{
        if(OLTs && i < OLTs.length && OLTs[i].ativo == 1){
            const obj = OLTs[i];
            this.olts[obj.options.idIxc] = new Olt(obj);
            await this.olts[obj.options.idIxc].getAuthorizedOnus();
            await this.updateOlts(i+1);
        }
    }

    startSocket = () => {
        this.sockets.on('connection', (socket) => { 
            const user = this.insertUser(socket);
            socket.on('startScan', async (num) => { 
                num != -1 ? user.startScan(num) : user.stopScan();
            });
    
            socket.on('caixa', async (caixa) => {
                const data = await snmp.busca_caixa(caixa, this.olts);
                this.sendMsgToUser(user, {type:'caixa', data});
            });
    
            socket.on('updatePorta', async (login) => {
                const onu = this.findOnuByMac(login.onu_mac)
                const resp = await onu.updatePorta(login);
                console.log(resp)
            });
            socket.on('disconnect', () => this.removeUser(socket));
        }
        
        );
    }

    insertUser = (socket) => {
        const user = this.users[socket.conn.id] = (new User({olts: this.olts, socket}));
        socket.emit('oltData', OLTs);
        return user;
    }

    removeUser = (socket) => {
        this.users[socket.conn.id].stopScan();
        delete this.users[socket.conn.id];
    }
    
}