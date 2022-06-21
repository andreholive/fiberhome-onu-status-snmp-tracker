import { IxcApi } from "../services/ixcApi";
import {Snmp} from '../services/snmp'
import { Olt } from "./Olt";
require('dotenv/config');
const api = new IxcApi();
const snmp = new Snmp();

class OnuToSend{
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
    constructor(data:Onu){
        this.index = data.index;
        this.onuIndex = data.onuIndex,
        this.macAddress = data.macAddress,
        this.slot = data.slot,
        this.pon = data.pon,
        this.onuId = data.onuId,
        this.status = data.status,
        this.options = data.options,
        this.login = data.login;
        this.optical = data.optical;
        this.cliente = data.cliente;
        this.fibra = data.fibra;
    }
}

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
    olt: Olt;
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
        this.olt = data.olt;
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

    async updateLoginAndClient(){
        if(this.login || this.cliente){
            return;
        }
        try{
            this.login = await api.getLogin(this.macAddress);
            this.cliente = await api.getClient(this.login.id_cliente);
        }
        catch(error){
            console.log(error)
        }      
    }

    async checkOnuStatusChange(){
        try {
            var status = await snmp.getOnuStatus(this.onuIndex, this.options);
            if(status != this.getStatus()){
                this.setStatus(status);
                await this.updateLoginAndClient();
                if(status == 1){ 
                    await this.getOpticalPower();
                }
                this.olt.send({type: 'connection', data: new OnuToSend(this)});
            }
       } catch (error) {
            throw new Error('CHECK ONU STATUS ERROR');
        }
    }

    async updateStatus(){
        try {
            var status = await snmp.getOnuStatus(this.onuIndex, this.options);
            this.setStatus(status);
        } catch (error) {
            console.log('Erro ao atualizar status da ONU');
        }
    }

    async updateOpticalPower()
    {
        try {
            this.optical = await snmp.getOnuOpticalPower(this.options, this.slot, this.pon, this.onuId);
        }
        catch(err){
            console.log('ERRO ao atualizar Optical Power');
        }
    }

    async updatePorta(login:any){
        try {
            await api.updatePortaClienteFibra(login.onu_mac, login.ftth_porta);
            await this.updateLogin(login);
        } catch (error) {
            
        }
    }
    
}