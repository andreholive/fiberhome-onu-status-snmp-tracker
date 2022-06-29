import { OltOptions } from "./Olt";

export type OnuType = {
    _onuIndex: number,
    macAddress: string,
    slot: number,
    pon: number,
    onuId: number
}

export type OnuOpticalData = {
    temperature: number,
    voltage: number,
    currTxBias: number,
    txPower: number,
    rxPower: number
}

export type OnuLoginData = {
    id_cliente: number,
    nome: string,
    id_caixa_ftth: number,
    ftth_porta: number,
    sinal_rx: number,
    sinal_tx: number,
    pppoe: string,
    senha: string,
    online: boolean,
    ip: string,
    cidade: string,
    bairro: string,
    latitude: number,
    longitude: number
}

export class Onu {
    _onuIndex: number;
    status: number = 0;
    slot: number;
    pon: number;
    onuId: number;
    private _optical!: OnuOpticalData;
    private _loginData!: OnuLoginData;
    private _macAddress: any;
    constructor(onu: OnuType, private readonly opt:OltOptions){
        this._onuIndex = onu._onuIndex;
        this._macAddress = onu.macAddress;
        this.slot = onu.slot;
        this.pon = onu.pon;
        this.onuId = onu.onuId;
    }

    public get macAddress(){
        return this._macAddress;
    }

    public set optical(opt: OnuOpticalData){
        this._optical = opt;
    }

    public get optical():OnuOpticalData{
        return this._optical;
    }

    public get options(){
        return this.opt;
    }

    public get loginData(){
        return this._loginData;
    }

    public set loginData(loginData:any){
        this._loginData = loginData;
    }

    setStatus(status:number){
        this.status = status;
    }

    setOpticalPower(opticalPower: OnuOpticalData){
        this.optical = opticalPower;
    }
}
