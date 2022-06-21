const fh = require('snmp-fiberhome');
const snmp = require('net-snmp');

const oids = {
    getOnuStatus: "1.3.6.1.4.1.5875.800.3.10.1.1.11",
}

export class Snmp{

    getAuthorizedOnus = async (opt) => {
        try{
            return await fh.getAuthorizedOnus(opt);
        }
        catch (error){
            throw new Error('SNMP ERROR', error);
        }
        
    }
    
    async get(oids, options) {
        return new Promise((resolve, reject) => {
            var session = snmp.createSession(options.ip, options.community)
            session.get(oids, function (error, varbinds) {
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

    async getOnuOpticalPower(options, slot, pon, onuId){
        try {
            return await fh.getOnuOpticalPower(options, slot, pon, onuId);
        } catch (error) {
            throw new Error('SNMP ERROR');
        }
        
    }

    async getOnuStatus(onuIndex, options){
        var oidss = [oids.getOnuStatus];
        oidss = oidss.map(oid => oid + '.' + onuIndex);
        try {
            var o = await this.get(oidss, options);
            var onuData = o[0];
            return onuData.value;
        } catch (error) {
            throw new Error('SNMP ERROR: getOnuStatusError');
        }
    }
}
   
