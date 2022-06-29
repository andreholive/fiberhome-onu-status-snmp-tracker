import { Olt } from "../entities/Olt";
import { Onu, OnuOpticalData, OnuType } from "../entities/Onu";

export default interface SnmpInterface {
    getAuthorizedOnus(olt: Olt):Promise<OnuType[]>;
    getOnuStatus(onu: Onu):Promise<number>;
    getOnuOpticalPower(onu: Onu):Promise<OnuOpticalData>;
}