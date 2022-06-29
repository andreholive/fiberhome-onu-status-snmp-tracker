import { Socket } from 'socket.io';
import UserController from '../controllers/UserController';


export default class WebSocketService{
    constructor(
        private readonly userController: UserController){}

    socket: any;

    public start(socket:Socket){
        this.socket = socket;
        socket.on('connection', (socket:any) => { 

            const user = this.userController.insertUser(socket);
            console.log('User connected');

            socket.on('startScan', async (oltId:number) => {
                this.userController.userStartOltScan(user, oltId);
            });

            socket.on('stopScan', async (oltId:number) => {
                this.userController.userStopOltScan(user);
            });
    
            socket.on('caixa', async (caixa:string) => {
                //const data = await this.searchCaixa(caixa);
                //this.sendMsgToUser(user, {type:'caixa', data});
            });
    
            socket.on('updatePorta', async (login:any) => {
                //const onu = this.findOnuByMacInOlts(login.onu_mac);
                //if(onu){
                    //await onu.updatePorta(login);
                //}
            });
    
            socket.on('cliente', async (name:any) => {
                //const clientList = await this.searchClient(name);
                //socket.emit('cliente', clientList);
            });
    
            socket.on('disconnect', () => {
                const user = this.userController.getUserById(socket.conn.id);
                this.userController.removeUser(user)
            });
        }
        
        );
    }
    
}