import OltService from "./services/OltService";
import WebSocketService from "./services/WebSocketService";
import WebSocket from "./WebSocket";

export default class Core{

    constructor(
        private readonly server:WebSocket, 
        private readonly websocketservice: WebSocketService,
        private readonly oltService: OltService
        ){}

    async start(){
        this.server.start();
        this.websocketservice.start(this.server.getSocket());
        await this.oltService.startService();
    }


}