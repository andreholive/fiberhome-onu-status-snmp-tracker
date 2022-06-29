import FiberHomeSnmp from './apis/FiberHomeSnmp';
import Core from './Core'
import SnmpInterface from './interfaces/SnmpInterface';
import OltService from './services/OltService';
import UserController from './controllers/UserController';
import WebSocketService from './services/WebSocketService';
import WebSocket from './WebSocket';
import OnuService from './services/OnuService';
import  IxcApi  from './apis/IxcApi';
import ProviderApiInterface from './interfaces/ProviderApiInterface';

const providerApi: ProviderApiInterface = new IxcApi();
const snmp: SnmpInterface = new FiberHomeSnmp();
const webSocket: WebSocket = new WebSocket();

const onuService = new OnuService(providerApi)
const oltService = new OltService(snmp, onuService);
const userManager = new UserController(oltService);
const webSocketService: WebSocketService = new WebSocketService(userManager);

const core = new Core(webSocket, webSocketService, oltService);
core.start();