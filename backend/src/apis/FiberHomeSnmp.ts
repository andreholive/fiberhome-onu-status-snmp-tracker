import { Olt } from "../entities/Olt";
import { Onu, OnuOpticalData, OnuType } from "../entities/Onu";
import SnmpInterface from "../interfaces/SnmpInterface";

const fh = require('snmp-fiberhome');
const snmp = require('net-snmp');

export default class FiberHomeSnmp implements SnmpInterface{

    private oids = {
        getOnuStatus: "1.3.6.1.4.1.5875.800.3.10.1.1.11",
    }

    private async get(oids:any, options:any) {
        return new Promise((resolve, reject) => {
            var session = snmp.createSession(options.ip, options.community)
            session.get(oids, function (error: any, varbinds: any) {
                if (error) {
                    session.close();
                    return reject(error)
                } else {
                    session.close();
                    return resolve(varbinds)
                }
                
            })
        })
    }

    private formatOpticalPowerData(opticalPower:any): OnuOpticalData{
        const opticalData = { 
            temperature: opticalPower.temperature.value,
            voltage: opticalPower.voltage.value,
            currTxBias: opticalPower.currTxBias.value,
            txPower: opticalPower.txPower.value,
            rxPower: opticalPower.rxPower.value
        }
        return opticalData;
    }

    public async getAuthorizedOnus(olt:Olt):Promise<OnuType[]>{
        try{
            return await fh.getAuthorizedOnus(olt.options);
        }
        catch (error){
            throw new Error('SNMP ERROR');
        }
        
    }

    public async getOnuOpticalPower(onu: Onu):Promise<OnuOpticalData>{
        try {
            const op = await fh.getOnuOpticalPower(onu.options, onu.slot, onu.pon, onu.onuId);
            return this.formatOpticalPowerData(op);
        } catch (error) {
            throw new Error('SNMP ERROR');
        }
        
    }

    public async getOnuStatus(onu: Onu):Promise<number>{
        var oidss = [this.oids.getOnuStatus];
        oidss = oidss.map(oid => oid + '.' + onu._onuIndex);
        try {
            var o:any = await this.get(oidss, onu.options);
            var onuData = o[0];
            return onuData.value;
        } catch (error) {
            throw new Error('SNMP ERROR: getOnuStatusError');
        }
    }
}
   
