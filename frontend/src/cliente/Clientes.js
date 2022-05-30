import React, {useEffect, useState} from 'react';
import ResultCliente from './ResultCliente';

function Clientes({socket, handler}) {

const [results, setResults] =  useState([]);

function goto(login){
    //setPosition({lat: parseFloat(login.latitude), lng: parseFloat(login.longitude)});
    //setMarks(login);
    console.log(login)
}

useEffect(() => {
    if(socket){
        socket.on('cliente', data => {
            setResults(data)
          });
    }
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