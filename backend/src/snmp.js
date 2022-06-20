const fh = require('snmp-fiberhome');
const snmp = require('net-snmp');

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
            throw new Error('SNMP ERROR', error);
        }
        
    }
}
   
