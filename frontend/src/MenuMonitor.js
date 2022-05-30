import React, {useState, useEffect} from 'react';
import LoginDrag from './LoginDrag';

import './menumonitor.css'

let conns = [];

function MenuMonitor({socket, handler}) {

    const [olts, setOlts] = useState([]);
    const [connections, setConnections] = useState([])

    useEffect(()=> {
        if(socket){
            socket.on('oltData', data => { setOlts([...data]); });
            socket.on('connection', data => {
                inserConnection(data);
              });
        }
    },[socket]);

    useEffect(()=> {
        if(handler){
            handler.addObserver(removeFromConnections)
        }
    },[handler]);

    function scan(value){
        socket.emit('startScan', value);
    }

    function searchConnections(onu)
    {
        let inList = Object.values(conns).findIndex((con, index) => {
        if(con.onuIndex == onu.onuIndex){
            return con.onuIndex == onu.onuIndex;
        } 
        });
        return inList;
    }

    function inserConnection(onu){
        const index = searchConnections(onu);
        if(index != -1)
        {
          conns[index].status = onu.status;
          conns[index].optical = onu.optical;
          conns[index].login.ip = onu.login.ip;
          conns[index].macAddress = onu.macAddress;
          setConnections([...conns]);
        }
        if(index === -1){
          conns.push(onu);
          setConnections([...conns]);
        }
    }

    function removeFromConnections(onu){
        console.log('called')
        let arr = [...connections]
        let inList = Object.values(arr).findIndex((con, index) => {
          if(con.id == onu.id){
            return con.id == onu.id;
          } 
        });
        if(inList != -1){
          arr.splice(inList, 1);
          conns = arr;
          setConnections([...arr]);
        }
    }

    return (
        
    <div className='menu_monitor'> 
        <input type='checkbox' id='toggle2' />
        <label className='wrapper_button2' htmlFor='toggle2'></label>
        <div className='menu_monitor_content'>
        <select onChange={e => {scan(e.target.value)}} className='select-olt'>
            <option key={-1} value={-1}>Parar</option>
            {olts.map((olt, index) => (
            <option key={index} value={olt.options.idIxc}>{olt.cidade}</option>
            ))}
        </select>
        <div className='connections'>
        {connections.map(onu => (
            <LoginDrag id={onu.login?.id ? onu.login.id : onu.macAddress} onu={onu} key={onu.login?.id ? onu.login.id : onu.macAddress} conn={true} ignore={removeFromConnections}/>
        ))}
        </div> 
        </div>           
    </div>
        
    )
}

export default MenuMonitor;