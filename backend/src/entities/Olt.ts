import {Snmp} from '../services/snmp'
import {Onu} from './Onu';
import {User} from './User'
const snmp = new Snmp();

interface Message{
    type: string;
    data: any
}

export class Olt{
    id: number;
    cidade: string;
    options: any;
    onus: Onu[];
    users: User[];
    scanNum: number;
    scanning: boolean;
    constructor(data:any){
        this.id = data.id,
        this.cidade = data.cidade,
        this.options = data.options,
        this.onus = [];
        this.users = [];
        this.scanNum = 1;
        this.scanning = false;
    }
    


    isScanning = ():boolean => this.scanning;

    getOnus():Onu[]{
        return this.onus;
    }
   
    send = async (msg:Message) => {
        const {type, data} = msg;
        Object.values(this.users).map(async (user) => {
            user.emitMessage({type, data})
        });
    }

    async getAuthorizedOnus()
    { 
        try {
            const authOnus = await snmp.getAuthorizedOnus(this.options);
            var i = 0;
            for(const onu of authOnus){
                this.onus[i] = new Onu({...onu, options: this.options, index: i, olt: this});
                i++;
            }
            console.log(`ONUs de ${this.cidade} Atualizadas!`);
        } catch (error) {
            console.log(`Erro ao conectar a ${this.cidade}`);
        }
        
    }   
    
    findOnuByMac(mac:any):Onu{
        const index = this.onus.findIndex((onu, index) => {
            if(onu.macAddress === mac){
                return index;
            }
        });
        return this.onus[index];
    }

    async startScan(user:User){
        this.users.push(user);
        if(!this.isScanning())
        {
            await this.updateOnuStatus();
            this.scanning = true;
            this.scan();
        }
    }

    stopScan(user:User){
        const index = this.users.indexOf(user);
        this.users.splice(index, 1);
        if(Object.values(this.users).length == 0){
            this.scanning = false;
            this.scanNum = 1;
        }
    }

    updateOnuStatus = async (i : number = 0) =>{
        if(this.onus && i < Object.keys(this.onus).length){
            await this.onus[i].updateStatus();
            await this.updateOnuStatus(i+1);
            return;
        }
        console.log(`Status das ONUs de ${this.cidade} Atualizados!`);
    }
    
    scan = async (i:number = 0) =>{
        if(i == 0){
            console.log('SCANNING', this.scanNum);
            this.send({type: 'scan', data: this.scanNum});
            this.scanNum++;
        }
        if(this.isScanning() && this.onus && i < Object.keys(this.onus).length){
            const onu = this.onus[i];
            await onu.checkOnuStatusChange();
            if(i == (this.onus.length-1)){
                this.scan();
                return; 
            }
            await this.scan(i+1);
        }
            
    }
        
    
}