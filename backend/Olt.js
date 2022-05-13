const fh = require('snmp-fiberhome');
const Onu = require('./Onu');

module.exports = class Olt{
    constructor(data){
        this.id = data.id,
        this.cidade = data.cidade,
        this.options = data.options,
        this.onus = []
    }

    async checkOnus() //primeira interação ao iniciar o servidor
    { 
        console.log('teste')
        try {
            console.log('teste2', this.options)
            const authOnus = await fh.getAuthorizedOnus(this.options);
            var i = 0;
            console.log('teste3')
            for(const onu of authOnus){
                this.onus[i] = new Onu({...onu, options: this.options});
                i++;
            }
            console.log(`ONUs de ${this.cidade} Atualizadas!`);
        } catch (error) {
            console.log(`Erro ao conectar a ${this.cidade}`);
        }
        
    }

    // fim da primeira interação

    getOnus(){
        return this.onus;
    }
    

    findOnuByMac(mac){
        const index = this.onus.findIndex((onu, index) => {
            if(onu.macAddress == mac){
                return index;
            }
        });
        return this.onus[index];
    }

    async updateOnuStatus(){
        const exec = async i =>{
            if(this.onus && i < Object.keys(this.onus).length){
                const status = await this.onus[i].checkOnuStatus();
                this.onus[i].setStatus(status);
                await exec(i+1)
            }
        }
        await exec(0);
        console.log(`Status das ONUs de ${this.cidade} Atualizados!`);
    }

    
//FUNCÃO QUE O USUÁRIO CHAMA PARA VERIFICAR SE UMA ONU ESTÁ ONLINE OU OFFLINE
    async checkOnuStatus(onu, next, scan, envia)
    {
        const status = await onu.checkOnuStatus();
        if(onu.getStatus() != status){ // verifica se o status mudou
            onu.setStatus(status);//grava o novo status
            if(status == 1){ //verifica se o status é ONLINE para...
                await onu.getOpticalPower(); //verificar a potencia do sinal
            }
            if(!onu.login){ //verifica se a onu possui um login vinculado
                await onu.getLogin(); //busca o login e vincula a ONU
            }
            if(onu.login){
                onu.login.onu_data = {index: onu.onuIndex, macAddress: onu.macAddress, status: status, slot: onu.slot, pon: onu.pon, optical: onu.optical }
                console.log(onu.login.cliente.razao, onu.getStatus(), onu.login.bairro, onu.macAddress)
                await envia({type: 'connection', data: onu.login});  
            }
            else{
                onu.login = {id: onu.macAddress};
                onu.login.onu_data = {index: onu.onuIndex, macAddress: onu.macAddress, status: status, slot: onu.slot, pon: onu.pon, optical: onu.optical };
                await envia({type: 'connection', data: onu.login});  
                onu.login = null;
                console.log("SEM LOGIN", onu.macAddress);
            }
            
        }
        this.onus.indexOf(onu) == (this.onus.length-1) ? scan() : await next();
    }
    
}