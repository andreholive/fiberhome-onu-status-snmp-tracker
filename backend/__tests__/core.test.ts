import Core from "../src/Core";
import IWebSocket from "../src/interfaces/IWebsocket"
import IWebSocketService from "../src/interfaces/IWebSocketService";

class WebSocketMock implements IWebSocket{
  private socket: any;
  constructor(){}
  start(){
    this.socket = 'Socket';
  };
  getSocket(){
    return this.socket;
  }
}

class WebSocketServiceMock implements IWebSocketService{
  public socket: any;
  constructor(){
    this.socket = null;
  }
  start(socket:any):void{
    this.socket = socket;
  };
}

describe('Core test', () => {
      let wb: IWebSocket;
      let wbs: IWebSocketService;
    beforeAll(() => {
      wb = new WebSocketMock();
      wbs = new WebSocketServiceMock();
    })
    it('should start Core Service', () => {
      const core = new Core(wb, wbs);
      core.start();
      expect(wbs.socket).toBe('Socket');
    })
})