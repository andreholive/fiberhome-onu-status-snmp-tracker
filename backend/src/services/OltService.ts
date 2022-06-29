import { Olt } from "../entities/Olt";
import { Onu, OnuType } from "../entities/Onu";
import { User } from "../entities/User";
import IOnuStatusObserver from "../interfaces/IOnuStatusObserver";
import SnmpInterface from "../interfaces/SnmpInterface";
import OnuStatusObserver from "../observers/OnuStatusObserver";
import { OLTs } from "../OltsData";
import OnuService from "./OnuService";

export default class OltService{

    constructor(private readonly snmp:SnmpInterface, private readonly onuService: OnuService){}
    
    private olts: Olt[] = [];

    private getOltById(id: number):Olt{
        return this.olts.filter(olt => olt.id == id)[0];
    }

    private async updateAllOnuStatus(olt: Olt){
        const getAllOnuStatus = async (i:number = 0) => {
            if(i < olt.onuList.length){
                const onu = olt.getOnuByIndex(i);
                const status = await this.snmp.getOnuStatus(onu);
                onu.setStatus(status);
                await getAllOnuStatus(i+1);
            }
        }
        await getAllOnuStatus();
        console.log('Status das Onus de '+olt.cidade+ ' Atualizadas!');
    }

    private async isOnuStatusChanged(onu: Onu):Promise<boolean>{
        try{
            const statusNow = await this.snmp.getOnuStatus(onu);
            if(onu.status != statusNow)
            {
                if(statusNow == 1)onu.optical = await this.snmp.getOnuOpticalPower(onu);
                onu.setStatus(statusNow);
                return true
            }
            return false;
        }catch(error){
            return false;
        }
        
    }

    private notifyOnuStatusChanged(olt:Olt, onu: Onu){
        olt.observers.forEach(obs => obs.emitOnuStatusChanged(onu));
    }

    private async getOnusFromOlt(olt: Olt){
        let onuList:Onu[] = [];
        const authOnus:OnuType[] = await this.snmp.getAuthorizedOnus(olt)
        for(var i = 0; i<authOnus.length; i++){
            onuList.push(new Onu(authOnus[i], olt.options));
        }
        olt.onuList = onuList;
        await this.updateAllOnuStatus(olt);
    }

    private async onuScanStart(olt: Olt){
        olt.addScanTime();
        console.log("Scan "+olt.scanTimes+" "+olt.cidade)
        const scan = async (i:number = 0) => {
            
            if(olt.isScanning && i < olt.onuList.length){
                const onu = olt.getOnuByIndex(i)
                if(await this.isOnuStatusChanged(onu)){
                    await this.onuService.updateOnuLoginData(onu);
                    this.notifyOnuStatusChanged(olt, onu);
                    console.log(onu);
                }
                await scan(i+1);
            }
            if(i==olt.onuList.length){
                await this.onuScanStart(olt);
            }
        }
        await scan();
    }

    private subscribeOnuStatusObserver(user:User):void{
        const olt =  this.getOltById(user.oltScan);
        let oltObservers: IOnuStatusObserver[] = olt.observers;
        oltObservers.push(new OnuStatusObserver(user));
        olt.observers = oltObservers;
    }

    private unSubscribeOnuStatusObserver(olt:Olt, user:User):void{
        let oltObservers = olt.observers;
        oltObservers = oltObservers?.filter(obs => obs.user != user);
        olt.observers = oltObservers;
    }

    public async startService(){
        const oltFactory = async (i = 0) =>{
            if(OLTs && i < OLTs.length && OLTs[i].ativo == 1){
                const olt = new Olt(OLTs[i]);
                this.olts.push(olt);
                await this.getOnusFromOlt(olt);
                await oltFactory(i+1);
            }
        }
        await oltFactory();
        console.log('Olts Updated!');
    }

    public startOltScan(user:User){
        const olt = this.getOltById(user.oltScan);
        const isOltScanning = olt.isScanning;
        this.subscribeOnuStatusObserver(user);
        if(!isOltScanning)this.onuScanStart(olt);  
    }

    public stopOltScan(user: User, oltId:number){
        const olt = this.getOltById(oltId);
        this.unSubscribeOnuStatusObserver(olt, user);
    }

}

