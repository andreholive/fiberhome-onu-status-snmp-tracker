const snmp = require('net-snmp');
const axios = require('axios');
const Queue = require("promise-queue");
Queue.configure(require('vow').Promise);
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

async function clienteFibra(mac) {
        
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
    return await axios.post(url, body, getHeader());
}

async function updateClienteFibra(fibra, caixa, porta) {
    const body = fibra.data.registros[0]; 
    const url = `${config.ixc_api}/webservice/v1/radpop_radio_cliente_fibra/${body.id}`;
    const header = {headers:{'Content-Type': 'application/json',
    Authorization: 'Basic ' + new Buffer.from(token).toString('base64'),
    }}
    body.id_caixa_ftth = caixa;
    body.porta_ftth = porta;
    return await axios.put(url, body, header);
}

async function updateLogin(data) {
    const login = await getLogin(data.login.onu_mac);
    const fibra = await clienteFibra(data.login.onu_mac);
    const url = `${config.ixc_api}/webservice/v1/radusuarios/${data.login.id}`;
    const body = login.data.registros[0];
    const header = {headers:{'Content-Type': 'application/json',
    Authorization: 'Basic ' + new Buffer.from(token).toString('base64'),
    }}   
    body.id_caixa_ftth = data.login.id_caixa_ftth;
    body.ftth_porta = data.login.ftth_porta;
    const update = await updateClienteFibra(fibra, body.id_caixa_ftth, body.ftth_porta);
    console.log(update.data)
    if(update.data.cliente_coord == 'success'){
        const updateLogin = await axios.put(url, body, header);
        if(updateLogin.data.type == 'success'){
            return true;
        }
        return false;
    }
    return false;
    
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

async function getClientMid(data, next) {
    const url = `${config.ixc_api}/webservice/v1/cliente`;
        const body =
            { 
            qtype: 'cliente.id',
            query: data.id_cliente,
            oper: '=',
            page: '1',
            rp: '1',
            sortname: 'cliente.id',
            sortorder: 'desc'
            };
    const res =  await axios.post(url, body, getHeader());
    data.cliente = res.data.registros[0];
    await next();
}

async function execute(data){
    const exec = async i =>{
        data && i < data.length &&
            await getClientMid(data[i], async () => await exec(i+1))
    }
    await exec(0)
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
        query: desc, //pesquisa do tecnico
        oper: 'L',
        page: '1',
        rp: '20',
        sortname: 'descricao',
        sortorder: 'desc',
        };
    const caixa = await axios.post(url, body, getHeader());
    if(caixa.data.total == 1){
        const logins = await getLoginsByCTO(caixa.data.registros[0].id);
        await execute(logins.data.registros);
        if(logins.data.registros){
            for(var i = 0; i < logins.data.registros.length; i++){
                const onu = findOnuinOltsbyMac(olts, logins.data.registros[i].onu_mac)
                if(onu){
                    const status = await onu.checkOnuStatus();
                    onu.setStatus(status);
                    if(status == 1){
                        await onu.getOpticalPower();
                    }
                    logins.data.registros[i].onu_data = onu;
                }
            }
            return {caixa: caixa.data.registros[0], logins: logins.data.registros}
        }
        else{
            return {caixa: caixa.data.registros[0], logins: null}
        }
        
    }
    return {caixa: false}
}

module.exports = {
    get,
    getLogin,
    getClient,
    busca_caixa,
    updateLogin,
    busca_cliente
    
}