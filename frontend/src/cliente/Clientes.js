import React, {useEffect, useState} from 'react';
import ResultCliente from './ResultCliente';

function Clientes({socket, handler,setSearching}) {

const [results, setResults] =  useState([]);

function goto(login){
    //setPosition({lat: parseFloat(login.latitude), lng: parseFloat(login.longitude)});
    //setMarks(login);
    console.log(login)
}

useEffect(() => {
    let isCancelled = false;
    if(!isCancelled)
    if(socket){
        socket.on('cliente', data => {
            setResults(data);
            setSearching(false)
          });
    }
    return () => {
        isCancelled = true;
      };
  },[socket]);

 return (
    <div>
        {results ? results.map(result => (
            <ResultCliente key={result.id} cliente={result}/>
        )) : null}
    </div>
  )
}

export default Clientes;