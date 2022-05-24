import React, {useEffect, useState} from 'react';
import PortaDrop from './PortaDrop';
import TrashDroppable from './TrashDroppable';
import { ShimmerSectionHeader } from "react-shimmer-effects";
import styled from 'styled-components';;


const Caixa = styled.div`
    position absolute;
    width: 452px;
    height: 100%;
    border: 1px solid #CCC;
    padding: 2px;
    z-index: 100;
    background-color: #FFF;
    box-shadow: 0 1px 2px rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
    overflow-y: scroll;
`;
const Portas = styled.div`
    position: relative;
    float: left;
    width: 435px;
    min-height: 600px;
`;
const Search = styled.div`
    position relative;
    float: left;
    width: 100%;
    height: 70px;
`;
const InputSearchCto = styled.input`
    width: 300px;
    height: 30px;
    font-size: 15px;
    font-weight: 500;
    color: #CCC;
    margin: 6px;
    border: 1px solid #CCC;
    border-radius: 5px
`;

const CtoInfo = styled.div`
    width: 380px;
    height: 30px;
    position: relative;
    float: left;
`;

let search = false;
let conns_caixa = [];

function CTO({socket, caixa, caixaData, setCaixa, setCaixaData, setMarks, setPosition}) {

const [busca, setBusca] = useState("");
const [searching, setSearching] = useState(false);
const [disabled, setDisabled] = useState(false);



useEffect(async () => {
    socket.on('caixa', data => {
        insertCaixa(data);
    });
},[]);

  function busca_cto(val){
    clearInterval(search);
    setBusca(val);
    search = setTimeout(async() =>{
          setCaixa([]);
          setDisabled(true);
          setSearching(true);
          socket.emit('caixa', val);
    }, 2000);
  }

  function insertCaixa(data){
    console.log(data)
    const caixa = data.caixa;
    if(caixa){
      const portas = data.caixa.capacidade;
      setDisabled(false);
      setSearching(false);
      setCaixaData(data);
      setPosition({lat: parseFloat(caixa.latitude), lng: parseFloat(caixa.longitude)})
      if(data.onus)
      {
        const onus = data.onus;
        for(const onu of onus)
        {
          conns_caixa.push(onu);
          //setMarks
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
          setCaixa((caixa) => [...caixa, {onu: login, ftth_porta: i}]);
        }
      }
      else{
        for(var i = 1; i<=portas; i++){
          setCaixa((caixa) => [...caixa, {onu: null, ftth_porta: i}]);
        }
      }
    }
    else{
      setDisabled(false);
      setSearching(false);
      setCaixa([]);
    }
  }

 return (
    <Caixa>
    <Search>
    <InputSearchCto onChange={(event) => {busca_cto(event.target.value);} } value={busca} placeholder='Buscar Caixa de Atendimento' disabled = {disabled}/>
    <TrashDroppable />
    <CtoInfo>{caixaData ? caixaData.caixa.descricao : ''}</CtoInfo>
    </Search>
    
    <Portas>
    {searching ? <ShimmerSectionHeader center /> : ''}
      {caixa.map(porta => (
          <PortaDrop id={porta.ftth_porta} onu={porta.onu} key={porta.ftth_porta}/>
        ))}
    </Portas>      
    </Caixa>
    
  )
}

export default CTO;