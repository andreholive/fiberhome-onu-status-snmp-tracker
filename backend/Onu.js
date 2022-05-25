const fh = require('snmp-fiberhome');
const snmp = require('./server_pack');
const {OIDs} = require('./oid-fh');
const config = require('./config.json');
const token = config.token;
const axios = require('axios');

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
        this.cliente = null;
        this.fibra = null;
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

    async getLogin(){
        var login = await snmp.getLogin(this.macAddress);
        if(login.data.registros)
        {
            this.login = login.data.registros[0];
            return this.login;
        }
        return false;
    }

    async getClienteFibra(mac) {
        
        const url = config.ixc_api+"/webservice/v1/radpop_radio_cliente_fibra";
            const body =
                { 
                qtype: 'mac',
                query: mac,
                oper: '=',
                page: '1',
                rp: '1',
                sortname: 'mac',
                sortorder: 'desc'
                };
        const req = await axios.post(url, body, snmp.getHeader());
        if(req.data.registros)
        {
            this.fibra = req.data.registros[0];
            return this.fibra;
        }
        return false;
    }

    async updateLogin(login){
        const url = `${config.ixc_api}/webservice/v1/radusuarios/${login.id}`;
        const header = {headers:{'Content-Type': 'application/json',
        Authorization: 'Basic ' + new Buffer.from(token).toString('base64'),
        }}
        const update= await axios.put(url, login, header);
        if(update.data.type == 'success'){
            await this.getLogin();
            return true;
        }
        return false;
    }

    async updatePortaClienteFibra(mac, porta) {
        const cliente_fibra = await this.getClienteFibra(mac);
        const url = `${config.ixc_api}/webservice/v1/radpop_radio_cliente_fibra/${cliente_fibra.id}`;
        const header = {headers:{'Content-Type': 'application/json',
        Authorization: 'Basic ' + new Buffer.from(token).toString('base64'),
        }}
        cliente_fibra.porta_ftth = porta;
        const req = await axios.put(url, cliente_fibra, header);
        if(req.data.type == 'success'){
            return true;
        }
        return false;
    }

    async updateCliente(){
        if(!this.login){
            await this.getLogin();
        }
        if(!this.cliente){
            var cliente = await snmp.getClient(this.login.id_cliente);
            if(cliente.data.registros[0])
            {
                this.cliente = cliente.data.registros[0];
            }
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

    async updatePorta(login){
        const update = await this.updatePortaClienteFibra(login.onu_mac, login.ftth_porta);
        if(update){
            const update_login = await this.updateLogin(login);
            if(update_login){
                console.log('Login '+login.login+' Atualizado');
                return true;
            }
            return false;
        }
        return false;
    }
    
}