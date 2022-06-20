import axios from 'axios';
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
            throw new Error('API GET ERROR');
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
            throw new Error('API GET ERROR');
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
            throw new Error('API GET ERROR');
        }
    }

    async updateLogin(login){
        try{
            const url = `${process.env.IXC_API}/webservice/v1/radusuarios/${login.id}`;
            const update= await axios.put(url, login, this.getHeader());
            if(update.data.type == 'success'){
                return true;
            }
        }
        catch(error){
            throw new Error('API PUT ERROR');
        }
    }
}
   
