import React, {useEffect, useState} from 'react';
import PortaDrop from '../PortaDrop';
import TrashDroppable from '../TrashDroppable';

import './caixa.css'

let conns_caixa = [];

function Caixa({socket, handler, setSearching}) {

const [ports, setPorts] = useState([]);

const [caixa, setCaixa] = useState({});

useEffect(() => {
  let isCancelled = false;
  if(!isCancelled){
  if(socket){
    socket.on('caixa', data => {
        insertCaixa(data);
        setSearching(false)
    });
  }
  }
  return () => {
    isCancelled = false;
  };
},[socket]);

useEffect(() => {
  if(ports.length) {
    handler?.setPorts(ports);
  }
},[ports]);

useEffect(() => {
  if(caixa.id) {
    handler?.setCaixa(caixa);
  }
},[caixa]);

useEffect(() => {
  if(handler)handler.addObserver(function set(e){setPorts(e)});
},[handler]);


function insertCaixa(data){
  console.log(data);
  setCaixa(data.caixa);
  const caixa_data = data.caixa;
  if(caixa_data){
    const portas = data.caixa.capacidade;
    if(data.onus)
    {
      const onus = data.onus;
      for(const onu of onus)
      {
        conns_caixa.push(onu);
      }
      function findLoginByPort(porta){
        var login = null;
        Object.values(onus).map(onu => {
          if(onu.login.ftth_porta == porta)
          login = onu;
        })
        return login;
      }
      for(var i = 1; i<=portas; i++){
        var login = findLoginByPort(i)
        setPorts((ports) => [...ports, {onu: login, ftth_porta: i}]);
      }
    }
    else{
      for(var i = 1; i<=portas; i++){
        setPorts((ports) => [...ports, {onu: null, ftth_porta: i}]);
      }
    }
  }
  else{
    setPorts([]);
  }
}

 return (
  <div className='portas'>
    <TrashDroppable />
      {ports ? ports.map(porta => (
          <PortaDrop id={porta.ftth_porta} onu={porta.onu} key={porta.ftth_porta}/>
        )) : null}
  </div>
  )
}

export default Caixa;