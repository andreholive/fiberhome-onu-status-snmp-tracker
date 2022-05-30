const snmp = require('net-snmp');
const axios = require('axios');
const config = require('./config.json');

const token = config.token;

function getHeader(){
    return {headers:{'Content-Type': 'application/json',
                    Authorization: 'Basic ' + new Buffer.from(token).toString('base64'),
                    ixcsoft: 'listar'
                }
            }
        }

async function get(oids, options) {
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

async function getLogin(mac) {
        
    const url = config.ixc_api+"/webservice/v1/radusuarios";
        const body =
            { 
            qtype: 'onu_mac',
            query: mac,
            oper: '=',
            page: '1',
            rp: '1',
            sortname: 'onu_mac',
            sortorder: 'desc'
            };
    return await axios.post(url, body, getHeader());
}

async function getClient(id) {
        
    const url = `${config.ixc_api}/webservice/v1/cliente`;
        const body =
            { 
            qtype: 'cliente.id',
            query: id,
            oper: '=',
            page: '1',
            rp: '1',
            sortname: 'cliente.id',
            sortorder: 'desc'
            };
    return await axios.post(url, body, getHeader());
}

async function getLoginsByCTO(id_caixa_ftth) {
        
    const url = `${config.ixc_api}/webservice/v1/radusuarios`;
        const body =
            { 
            qtype: 'id_caixa_ftth',
            query: id_caixa_ftth,
            oper: '=',
            page: '1',
            rp: '32',
            sortname: 'onu_mac',
            sortorder: 'desc'
            };
    return await axios.post(url, body, getHeader());
}

async function getLoginbyClient(client, next) {
    const url = `${config.ixc_api}/webservice/v1/radusuarios`;
        const body =
            { 
            qtype: 'id_cliente',
            query: client.id,
            oper: '=',
            page: '1',
            rp: '50',
            sortname: 'id_cliente',
            sortorder: 'desc'
            };
    const login = await axios.post(url, body, getHeader());
    client.logins = login.data.registros;
    await next();
}

async function busca_cliente(razao) {
    
    const url = `${config.ixc_api}/webservice/v1/cliente`;
        const body =
            { 
            qtype: 'cliente.razao',
            query: razao,
            oper: 'L',
            page: '1',
            rp: '50',
            sortname: 'cliente.razao',
            sortorder: 'desc'
            };
    const res = await axios.post(url, body, getHeader());
    var data = res.data.registros;
    if(data && data.length != 0){
      const exec = async i =>{
        data && i < data.length &&
            await getLoginbyClient(data[i], async () => await exec(i+1))
    }
    await exec(0)  
    }
    return data;
}

function findOnuinOltsbyMac(olts, mac){
    for(const olt of Object.values(olts)){
        const onu = olt.findOnuByMac(mac);
        if(onu != -1){
            return onu;
        }
    }
}

async function busca_caixa(desc, olts) {
    const url = `${config.ixc_api}/webservice/v1/rad_caixa_ftth`;
    const body =
        { 
        qtype: 'descricao',
        query: desc,
        oper: 'L',
        page: '1',
        rp: '20',
        sortname: 'descricao',
        sortorder: 'desc',
        };
    const caixa = await axios.post(url, body, getHeader());
    if(caixa.data.total == 1){
        let logins = await getLoginsByCTO(caixa.data.registros[0].id);
        let onus = [];
        logins = logins.data.registros;
        if(logins){
           const exec = async i =>{
                if(logins && i < logins.length){
                    const onu = findOnuinOltsbyMac(olts, logins[i].onu_mac);
                    await onu.updateStatus();
                    await onu.getLogin();
                    await onu.updateCliente();
                    onus.push(onu);
                    await exec(i+1);
                }
            }
            await exec(0);
            return {caixa: caixa.data.registros[0], onus}
        }
        else{
            return {caixa: caixa.data.registros[0], onus: null}
        }
        
    }
    return {caixa: false}
}

module.exports = {
    get,
    getLogin,
    getClient,
    busca_caixa,
    busca_cliente,
    getHeader
    
}