import { Onu, OnuLoginData } from "../entities/Onu";

export default interface ProviderApiInterface {
    getOnuLoginData(onu: Onu):Promise<OnuLoginData>
}