import { User } from "../entities/User";
import { Socket } from "socket.io";
import { OLTs } from "../OltsData";
import OltService from "../services/OltService";

export default class UserController{
    private users: User[] = [];
    constructor(public readonly oltService: OltService){}

    public insertUser(socket: Socket):User{
        const user = new User(socket);
        this.users.push(user);
        user.socket.emit('oltData', OLTs);
        return user;
    }

    public removeUser(user: User):void{
        this.users = this.users.filter(users => users != user);
    }

    public getUserById(id:string):User{
        return this.users.filter(user => user.id == id)[0];
    }

    public userStartOltScan(user:User, oltId: number){
        user.oltScan = oltId;
        this.oltService.startOltScan(user);     
    }

    public userStopOltScan(user:User){
        this.oltService.stopOltScan(user, user.oltScan);
        user.oltScan = -1;
    }

}