import app from './app'
import { createServer } from 'http';
import { Server } from "socket.io";

export default class WebSocket{
    private server: any;
    private socket: any;
    constructor(){}

    start(){
      console.log("Starting WebServer...");
      this.server = createServer(app);

      this.socket = new Server(this.server, {
          cors: {
            origin: "*",
            methods: ["GET", "POST"]
          }
        });
      this.server.listen(process.env.PORT || 3001, async () => { 
        console.log(`Server Listening on port: ${process.env.PORT || 3001}`);
      });
    }

    getSocket(){
      return this.socket;
    }
}
