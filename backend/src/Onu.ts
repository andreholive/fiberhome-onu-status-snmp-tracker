const fh = require('snmp-fiberhome');
import { IxcApi } from "./ixcApi";
import {Snmp} from './snmp'
const api = new IxcApi();
const snmp = new Snmp();
import {OIDs} from './oid-fh';
require('dotenv/config');
const axios = require('axios');

export class Onu{
    index: number;
    onuIndex: number;
    status: number;
    macAddress: any;
    slot: number;
    pon: number;
    onuId: number;
    login: any;
    options: any;
    optical: any;
    cliente: any;
    fibra: any;
    constructor(data:any){
        this.index = data.index;
        this.onuIndex = data._onuIndex,
        this.macAddress = data.macAddress,
        this.slot = data.slot,
        this.pon = data.pon,
        this.onuId = data.onuId,
        this.status = 0,
        this.options = data.options,
        this.login = null;
        this.optical = null;
        this.cliente = null;
        this.fibra = null;
    }


    
    setStatus(status:number){
        this.status = status;
    }

    getStatus(){
        return this.status;
    }

    setLogin(login:any){
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
        try{
            this.login = await api.getLogin(this.macAddress);
        }
        catch(error){
            console.log(error)
        }
    }

    async updateLogin(login:any){
        try{
            if(await api.updateLogin(login)){
                await this.getLogin();
                return true;
            }
        }catch(error){
            throw new Error('UPDATE LOGIN ERROR');
        }
    }

    async updatePortaClienteFibra(mac:any, porta:any) {
        const cliente_fibra = await api.getClienteFibra(mac);
        const url = `${process.env.IXC_API}/webservice/v1/radpop_radio_cliente_fibra/${cliente_fibra.id}`;
        const header = {headers:{'Content-Type': 'application/json',
        Authorization: 'Basic ' + process.env.TOKEN
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
            this.cliente = await api.getClient(this.login.id_cliente);
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
            throw new Error('CHECK ONU STATUS ERROR');
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
            this.optical = await snmp.getOnuOpticalPower(this.options, this.slot, this.pon, this.onuId);
        }
        catch(err){
            console.log('ERRO ao atualizar Optical Power')
            return false;
        }
    }

    async updatePorta(login:any){
        try {
            const update = await this.updatePortaClienteFibra(login.onu_mac, login.ftth_porta);
        if(update){
            const update_login = await this.updateLogin(login);
            if(update_login){
                console.log('Login '+login.login+' Atualizado');
                return true;
            }
            return false;
        }
        } catch (error) {
            return false;
        }
        
        
    }
    
}