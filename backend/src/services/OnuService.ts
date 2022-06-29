import { Onu } from "../entities/Onu";
import { ApiGetError } from "../errors/ApiErrors";
import ProviderApiInterface from "../interfaces/ProviderApiInterface";

export default class OnuService{
    constructor(private readonly providerApi: ProviderApiInterface){}

    public async updateOnuLoginData(onu: Onu){
        try{
            if(!onu.loginData){
                onu.loginData = await this.providerApi.getOnuLoginData(onu);
            }
        }
        catch(error){
            onu.loginData = null;
        }
        
    }
}