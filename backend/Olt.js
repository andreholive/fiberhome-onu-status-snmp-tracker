const fh = require('snmp-fiberhome');
const Onu = require('./Onu');

module.exports = class Olt{
    constructor(data){
        this.id = data.id,
        this.cidade = data.cidade,
        this.options = data.options,
        this.onus = []
    }


    /* checkOnus() atualiza todas as ONUs que estão autorizadas na OLT */

    async checkOnus()
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

    /* getOnus() retorna as ONUs desta OLT */

    getOnus(){
        return this.onus;
    }

    onu = (index) => this.onus[index];
    

    findOnuByMac(mac){
        const index = this.onus.findIndex((onu, index) => {
            if(onu.macAddress === mac){
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
        if(onu.getStatus() != status){
            onu.setStatus(status);
            if(status == 1){
                await onu.updateOpticalPower(); 
            }
            if(!onu.getLogin()){ 
                await onu.updateCliente(); 
            }
            console.log(onu.optical);
            await envia({type: 'connection', data: onu});
            
        }
        this.onus.indexOf(onu) == (this.onus.length-1) ? scan() : await next();
    }

    async updateOnus(onuList){
        const exec = async i =>{
            if(onuList && i < onuList.length){
                const onu = this.findOnuByMac(onuList[i].macAddress);
                await onu.updateStatus();
                await exec(i+1)
            }
        }
        await exec(0);
    }
    
}