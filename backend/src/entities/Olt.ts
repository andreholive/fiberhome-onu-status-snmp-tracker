import IOnuStatusObserver from '../interfaces/IOnuStatusObserver';
import { Onu } from './Onu';

export type OltOptions = {
    idIxc: number,
    ip: string,
    community: string,
    port: number,
    trapPort: number,
    enableWarnings: boolean,
    enableLogs: boolean,      
}

export class Olt{
    private onus:Onu[] = [];
    private _id: any;
    private city: any;
    private _options: OltOptions;
    private _scanTimes: number = 0;
    private _observers: IOnuStatusObserver[] = [];
    constructor(data:any){
        this._id = data.options.idIxc;
        this.city = data.cidade;
        this._options = data.options;
    }

    public get id(){
        return this._id
    }

    public get options():OltOptions{
        return this._options;
    }
    
    public get onuList():Onu[] {
        return this.onus;
    }

    public get cidade():Onu[] {
        return this.city;
    }

    public get isScanning():boolean{
        if(this.observers.length != 0){
            return true
        }
        return false;
    }

    public get observers():IOnuStatusObserver[]{
        return this._observers;
    }

    public get scanTimes(){
        return this._scanTimes
    }

    public set observers(observerList: IOnuStatusObserver[]){
        this._observers = observerList;
    }

    public set onuList(onulist: Onu[]){
        this.onus = onulist;
    }

    public getOnuByIndex(index:number){
        return this.onus[index];
    }

    public getOnuByMac(mac:any):Onu{
        return this.onuList.filter(onu => onu.macAddress == mac)[0];
    }

    public addScanTime(){
        this._scanTimes++;
    }

    public resetScanTimes(){
        this._scanTimes = 0;
    }


}