import { Onu } from "../entities/Onu";
import { User } from "../entities/User";

export default interface IOnuStatusObserver{
    emitOnuStatusChanged(onu: Onu):void;
    get user(): User;
}