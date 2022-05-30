export default function StartHandlers(configuration){
let ports = [];
let caixa = {};
let socket = configuration.socket;

const state ={
    observer: []
} 

const setPorts = (ports_array) => {
    ports = ports_array;
}

const setCaixa = (caixa_obj) => {
  caixa = caixa_obj;
}

const addObserver = (obsvr) => {
   if(!state.observer[obsvr.name])state.observer[obsvr.name] = obsvr;
}

const haveObserver = (obsvr) => state.observer[obsvr];

const handleDragEnd = (event) =>{
    let arr = [...ports];
    if(event.over){
      const {over, active} = event;
      let isConn = () => active.data.current.isConn;
      if(over.id === active.id){
        return;
      }
      if(over.id === 'trash'){
        if(isConn()){
          return;
        }
        arr[active.id -1].onu = null;
        active.data.current.onu.login.ftth_porta = '';
        active.data.current.onu.login.id_caixa_ftth = '';
        socket.emit('updatePorta', active.data.current.onu.login);
        state.observer['set'](arr);
      }
      if(!arr[over.id - 1].onu) //verifica slot vazio
      {
        if(!isConn())arr[active.id -1].onu = null;
        arr[over.id - 1].onu = active.data.current.onu;
        active.id = over.id;
        active.data.current.onu.login.ftth_porta = over.id;
        active.data.current.onu.login.id_caixa_ftth = caixa.id;
        if(isConn()){
          console.log('removed')
            state.observer['removeFromConnections'](active.data.current.onu);
        }
        socket.emit('updatePorta', active.data.current.onu.login);
      }
      state.observer['set'](arr);
    }
}
return {handleDragEnd, setPorts, addObserver, haveObserver, setCaixa};
}