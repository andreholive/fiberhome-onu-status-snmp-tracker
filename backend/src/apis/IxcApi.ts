import axios from 'axios';
import { Onu, OnuLoginData } from '../entities/Onu';
import { ApiGetError } from '../errors/ApiErrors';
import ProviderApiInterface from '../interfaces/ProviderApiInterface';
require('dotenv/config');

export default class IxcApi implements ProviderApiInterface{

    private getHeader(){
        return {headers:{'Content-Type': 'application/json',
                        Authorization: 'Basic ' + new (Buffer as any).from(process.env.TOKEN).toString('base64'),
                        ixcsoft: 'listar'
                    }
                }
    }

    async getLoginbyClient(client:any) {
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
        return login.data.registros;
    }

    async updateLogin(login:any) {
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

    
    async updatePortLogin(mac:any, porta:any){
        try{
            const cliente_fibra = await this.getClienteFibra(mac);
            const url = `${process.env.IXC_API}/webservice/v1/radpop_radio_cliente_fibra/${cliente_fibra.id}`;
            const header = {headers:{'Content-Type': 'application/json',
            Authorization: 'Basic ' + process.env.TOKEN
            }}
            cliente_fibra.porta_ftth = porta;
            await axios.put(url, cliente_fibra, header);
            }
            catch(error){
                throw new Error('API PUT ERROR');
            }
    }

    
    
    
    
    async getLoginsToClientsList(clientList:any){
        if(clientList && clientList.length != 0){
            const exec = async (i = 0) =>{
            clientList && i < clientList.length &&
                  await this.getLoginbyClient(clientList[i]);
            }
            await exec();
        }
    }

    async findClientsByName(razao:any) {
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

    async searchCaixa(desc:any) {
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

    async getLoginsByCTO(id_caixa_ftth:any) {
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

    private formatLoginData(login:any, client:any, fibra:any):OnuLoginData{
        return {
            id_cliente: client.id,
            nome: client.razao,
            id_caixa_ftth: login.id_caixa_ftth,
            ftth_porta: login.ftth_porta,
            sinal_rx: fibra.sinal_rx,
			sinal_tx: fibra.sinal_tx,
            pppoe: login.login,
            senha: login.senha,
            online: login.online == 'S',
            ip: login.ip,
            cidade: login.cidade,
            bairro: login.bairro,
            latitude: fibra.latitude,
			longitude: fibra.longitude
        }
    }

    private async getClienteFibra(mac:any) {
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
                return req.data.registros[0];
            }
            throw new Error('No fiber client found');
        }
        catch(error){
            throw new ApiGetError('Get Fiber Clients Error');
        }
    }

    private async getClientByClientId(id:any) {
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
                if(cliente.data.registros){
                    return cliente.data.registros[0];
                }
                throw new ApiGetError('No client found!');         
        }
        catch(error){
            throw new ApiGetError('Get Client Error');
        }
        
    }

    private async getLoginByMac(mac:any) {
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
            if(login.data.registros){
                return login.data.registros[0];
            }
            throw new ApiGetError('No Login found!');
        }
        catch(error){
            throw new ApiGetError('Get login Error');
        }
        
    }

    public async getOnuLoginData(onu: Onu):Promise<OnuLoginData>{
        const login = await this.getLoginByMac(onu.macAddress);
        const client = await this.getClientByClientId(login.id_cliente);
        const fibra = await this.getClienteFibra(onu.macAddress)
        return this.formatLoginData(login, client, fibra);
    }
}
   
