const fh = require('snmp-fiberhome');
const snmp = require('./server_pack');
const {OIDs} = require('./oid-fh');

module.exports = class Onu{
    constructor(data){
        this.index = data.index;
        this.onuIndex = data._onuIndex,
        this.macAddress = data.macAddress,
        this.slot = data.slot,
        this.pon = data.pon,
        this.onuId = data.onuId,
        this.status = null,
        this.options = data.options,
        this.login = null;
        this.optical = null;
        this.cliente = null
    }


    
    setStatus(status){
        this.status = status;
    }

    getStatus(){
        return this.status;
    }

    setLogin(login){
        this.login = login;
    }

    getLogin(){
        return this.login;
    }

    getOpticalPower() {
        return this.optical;
    }

    getCliente() {
        return this.cliente;
    }

    async getOnuData()
    {
        const status = await this.checkOnuStatus();
        if(this.getStatus() != status){ 
            this.setStatus(status);
            if(status == 1){ 
                await this.getOpticalPower();
            }
        }
        return this;
    }

    async updateLogin(){
        if(!this.login){
            var login = await snmp.getLogin(this.macAddress);
            if(login.data.registros)
            {
                this.login = login.data.registros[0];
                return this.login;
            }
            return null;
        }
    }

    async updateCliente(){
        if(!this.login){
            await this.updateLogin();
        }
        var cliente = await snmp.getClient(this.login.id_cliente);
        if(cliente.data.registros[0])
        {
            this.cliente = cliente.data.registros[0];
        }
            
    }

    async checkOnuStatus(){
        var oids = [OIDs.getOnuStatus];
        oids = oids.map(oid => oid + '.' + this.onuIndex);
        try {
            var o = await snmp.get(oids, this.options);
            var onuData = o[0];
            return onuData.value;
        } catch (error) {
            return false;
        }
    }

    async updateStatus(){
        var oids = [OIDs.getOnuStatus];
        oids = oids.map(oid => oid + '.' + this.onuIndex);
        try {
            var o = await snmp.get(oids, this.options);
            var onuData = o[0];
            this.setStatus(onuData.value);
            onuData.value == 1 ? await this.updateOpticalPower() : false;
        } catch (error) {
            console.log('Erro ao atualizar status da ONU');
            return false;
        }
    }

    async updateOpticalPower()
    {
        try {
            this.optical = await fh.getOnuOpticalPower(this.options, this.slot, this.pon, this.onuId);
        }
        catch(err){
            console.log('ERRO ao atualizar Optical Power')
            return false;
        }
    }
    
}