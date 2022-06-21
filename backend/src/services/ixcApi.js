import axios from 'axios';
import { ApiGetError } from '../errors/ApiErrors';
require('dotenv/config');

export class IxcApi{

    getHeader(){
        return {headers:{'Content-Type': 'application/json',
                        Authorization: 'Basic ' + new Buffer.from(process.env.TOKEN).toString('base64'),
                        ixcsoft: 'listar'
                    }
                }
    }

    async getClient(id) {
        try{
            const url = `${process.env.IXC_API}/webservice/v1/cliente`;
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
                const cliente = await axios.post(url, body, this.getHeader());
                return cliente.data.registros[0];
        }
        catch(error){
            throw new ApiGetError('Get Client Error');
        }
        
    }

    async getLogin(mac) {
        try{
            const url = process.env.IXC_API+"/webservice/v1/radusuarios";
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
            const login = await axios.post(url, body, this.getHeader());
            return login.data.registros[0];
        }
        catch(error){
            throw new ApiGetError('Get login Error');
        }
        
    }

    async getClienteFibra(mac) {
        try{
            const url = process.env.IXC_API+"/webservice/v1/radpop_radio_cliente_fibra";
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
            const req = await axios.post(url, body, this.getHeader());
            if(req.data.registros)
            {
                this.fibra = req.data.registros[0];
                return this.fibra;
            }
            throw new Error('NO DATA ERROR');
        }
        catch(error){
            throw new ApiGetError('Get Fiber Clients Error');
        }
    }

    async updateLogin(login){
        try{
            const url = `${process.env.IXC_API}/webservice/v1/radusuarios/${login.id}`;
            const update = await axios.put(url, login, this.getHeader());
            console.log(update.data);
            return update.data;
        }
        catch(error){
            throw new Error('API PUT ERROR');
        }
    }

    async updatePortaClienteFibra(mac, porta) {
        try{
        const cliente_fibra = await this.getClienteFibra(mac);
        const url = `${process.env.IXC_API}/webservice/v1/radpop_radio_cliente_fibra/${cliente_fibra.id}`;
        const header = {headers:{'Content-Type': 'application/json',
        Authorization: 'Basic ' + process.env.TOKEN
        }}
        cliente_fibra.porta_ftth = porta;
        const req = await axios.put(url, cliente_fibra, header);
        if(req.data.type == 'success'){
            return true;
        }
        }
        catch(error){
            throw new Error('API PUT ERROR');
        }
    }

    async getLoginbyClient(client, next) {
        const url = `${process.env.IXC_API}/webservice/v1/radusuarios`;
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
        const login = await axios.post(url, body, this.getHeader());
        client.logins = login.data.registros;
        await next();
    }

    async getLoginsToClientsList(clientList){
        if(clientList && clientList.length != 0){
            const exec = async (i = 0) =>{
            clientList && i < clientList.length &&
                  await this.getLoginbyClient(clientList[i], async () => await exec(i+1));
            }
            await exec();
        }
    }

    async findClientsByName(razao) {
        try{
            const url = `${process.env.IXC_API}/webservice/v1/cliente`;
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
                const res = await axios.post(url, body, this.getHeader());
                var data = res.data.registros;
                return data;
        }
        catch(error){
            throw new ApiGetError('Find Client By Name error');
        }   
    }

    async searchCaixa(desc) {
        try{
            const url = `${process.env.IXC_API}/webservice/v1/rad_caixa_ftth`;
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
            const caixa = await axios.post(url, body, this.getHeader());
            return caixa.data.registros[0];
        }
        catch(error){
            throw new ApiGetError('Find Caixa Error');
        }
        
    }

    async getLoginsByCTO(id_caixa_ftth) {
        try{
            const url = `${process.env.IXC_API}/webservice/v1/radusuarios`;
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
            var logins = await axios.post(url, body, this.getHeader());
            return logins.data.registros;
        }
        catch(error){
            throw new ApiGetError('Find Logins By Cto Error');
        }
        
    }
}
   
