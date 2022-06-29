import { Onu } from "../entities/Onu";
import { User } from "../entities/User";
import IOnuStatusObserver from "../interfaces/IOnuStatusObserver";

export default class OnuStatusObserver implements IOnuStatusObserver{
    constructor(public readonly _user:User){}

    emitOnuStatusChanged(onu: Onu): void {
        this.user.socket.emit('onuStatusChanged', onu);
    }

    public get user():User{
        return this._user;
    }
}