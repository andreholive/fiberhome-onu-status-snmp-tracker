import React from 'react';
import styled from 'styled-components';
import ResultCliente from './ResultCliente';

const Input = styled.input`
    width: 415px;
    height: 30px;
    font-size: 15px;
    font-weight: 500;
    color: #CCC;
    margin: 6px;
    border: 1px solid #CCC;
    border-radius: 5px;
    position: relative;
    float: left;
    z-index: 50;
`;

function Clientes({results, buscaCliente, buscaClientes, setMarks, setPosition}) {

function goto(login){
    setPosition({lat: parseFloat(login.latitude), lng: parseFloat(login.longitude)});
    //setMarks(login);
    console.log(login)
}

 return (
    <>
    <Input onChange={(event) => {buscaClientes(event.target.value);} } value={buscaCliente} placeholder='Buscar Cliente' />
    <div>
        {results.map(result => (
            result.logins ?
            <ResultCliente cliente={result} key={result.id} goto={(login)=>{goto(login)}}/>
            : ''
        ))}
    </div>
    </>
  )
}

export default Clientes;