const snmp = require('./server_pack');

module.exports = class User{
    constructor(data){
        this.socket = data.socket;
        this.olts = data.olts;
        this.scanning = false;
        this.test = 1;
        this.inDatas();
    }

    async envia(d){
        this.socket.emit(d.type, d.data);
    }

    findOnuByMac(mac){
        for(const olt of Object.values(this.olts)){
            const onu = olt.findOnuByMac(mac);
            if(onu != -1){
                return onu;
            }
        }
    }

    async inDatas(){
        console.log('User Conected!')
        this.socket.on('startScan', async (num) => { //RECEBE COMANDO PARA INICIAR O SCAN DAS ONUS
            if(num != -1){
                this.startScan(this.olts[num]);
            }
            else{
                this.stopScan();
            }
        });
        this.socket.on('caixa', async (data) => {
            console.log(data)
            const res = await snmp.busca_caixa(data, this.olts);
            this.socket.emit('caixa', res);
        });
        this.socket.on('updatePorta', async (login) => {
            const resp = await this.updatePorta(login);
            //socket.emit('updatePorta', resp.data);
            console.log(resp)
        });
    }

    async startScan(olt) // CHAMA O INICIO DO SCAN E MANTEM O STATUS TRUE DO SCANING
    {  
        await olt.updateOnuStatus();
        this.scanning = true;
        this.scan(olt);
    }

    stopScan() // PARA O SCAN
    { 
        this.scanning = false;
        this.test = 1;
    }

    async scan(olt){ //INICIA O SCAN E MANTEM ATÉ QUE SEJA PARADO
        console.log('Scanning', this.test);
        this.socket.emit('scan', this.test);
        this.test++;
        const exec = async i =>{
            if(this.scanning && olt.onus && i < Object.keys(olt.onus).length){
                await olt.checkOnuStatus(olt.onus[i], async () => await exec(i+1), async () => this.scan(olt), async (data) => {this.envia(data)})
            } 
                
        }
        await exec(0)
    }

    async updatePorta(login){
        const onu = this.findOnuByMac(login.onu_mac);
        const update = await onu.updatePortaClienteFibra(login.onu_mac, login.ftth_porta);
        if(update){
            const update_login = await onu.updateLogin(login);
            if(update_login){
                console.log('Login '+login.login+' Atualizado');
                return true;
            }
            return false;
        }
        return false;
    }

    
    
}