const fh = require('snmp-fiberhome');
const Onu = require('./Onu');

module.exports = class Olt{
    constructor(data){
        this.id = data.id,
        this.cidade = data.cidade,
        this.options = data.options,
        this.onus = [];
        this.users = [];
        this.scanNum = 1;
        this.scanning = false;
    }


   isScanning = () => this.scanning;

   send = async (obj) => {
    Object.values(this.users).map(async (user) => {
        await user.socket.emit(obj.type, obj.data)
    });
   }

    async getAuthorizedOnus()
    { 
        try {
            const authOnus = await fh.getAuthorizedOnus(this.options);
            var i = 0;
            for(const onu of authOnus){
                this.onus[i] = new Onu({...onu, options: this.options, index: i});
                i++;
            }
            console.log(`ONUs de ${this.cidade} Atualizadas!`);
        } catch (error) {
            console.log(`Erro ao conectar a ${this.cidade}`);
        }
        
    }

    getOnus(){
        return this.onus;
    }
    
    findOnuByMac(mac){
        const index = this.onus.findIndex((onu, index) => {
            if(onu.macAddress === mac){
                return index;
            }
        });
        return this.onus[index];
    }

    updateOnuStatus = async i =>{
        if(this.onus && i < Object.keys(this.onus).length){
            const status = await this.onus[i].checkOnuStatus();
            this.onus[i].setStatus(status);
            await this.updateOnuStatus(i+1);
            return;
        }
        console.log(`Status das ONUs de ${this.cidade} Atualizados!`);
    }

    async startScan(user){
        this.users.push(user);
        if(!this.isScanning())
        {
            await this.updateOnuStatus(0);
            this.scanning = true;
            this.scan(0);
        }
    }

    stopScan(user){
        
        const index = this.users.indexOf(user);
        this.users.splice(index, 1);
        if(Object.values(this.users).length == 0){
            this.scanning = false;
            this.scanNum = 1;
        }
    }
    
    scan = async i =>{
        if(i == 0){
            console.log('SCANNING', this.scanNum);
            this.send({type: 'scan', data: this.scanNum});
            this.scanNum++;
        }
        if(this.isScanning() && this.onus && i < Object.keys(this.onus).length){
            const onu = this.onus[i];
            const status = await onu.checkOnuStatus();
            if(onu.getStatus() != status){
                onu.setStatus(status);
                if(status == 1){
                    await onu.updateOpticalPower(); 
                }
                await onu.updateCliente(); 
                await this.send({type: 'connection', data: onu});
            }
            if(i == (this.onus.length-1)){
                this.scan(0);
                return; 
            }
            await this.scan(i+1);
        }   
    }
        
    
}