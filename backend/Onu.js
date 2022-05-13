const fh = require('snmp-fiberhome');
const snmp = require('./server_pack');
const {OIDs} = require('./oid-fh');

module.exports = class Onu{
    constructor(data){
        this.onuIndex = data._onuIndex,
        this.macAddress = data.macAddress,
        this.slot = data.slot,
        this.pon = data.pon,
        this.onuId = data.onuId,
        this.status = null,
        this.options = data.options,
        this.login = null;
        this.optical = null;
    }


    // função que a olt chama para gravar o status na ONU
    setStatus(status){
        this.status = status;
    }

    getStatus(){
        return this.status;
    }
    

    async getOpticalPower()
    {
        try {
            this.optical = await fh.getOnuOpticalPower(this.options, this.slot, this.pon, this.onuId);
        }
        catch(err){
            return false;
        }
    }

    async getLogin(){
        if(!this.login){
            var login = await snmp.getLogin(this.macAddress);
            if(login.data.registros)
            {
                this.login = login.data.registros[0];
                var cliente = await snmp.getClient(login.data.registros[0].id_cliente);
                if(cliente.data.registros[0])
                {
                    this.login.cliente = cliente.data.registros[0];
                }
            }
        }
    }


    //FUNÇÃO QUE A OLT CHAMA PARA VERIFICAR O STATUS DE UMA ONU
    //RETORNA O VALOR DO STATUS

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
    
}