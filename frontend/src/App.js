import React, {useState, useEffect, useRef} from 'react';
import {DndContext} from '@dnd-kit/core';
import styled from 'styled-components';
import socketIOClient from 'socket.io-client';
import LoginDrag from './LoginDrag';
import Clientes from './Clientes';
import ClientesData from './ClientesData'
import Map from './Map';
import Header from './components/Header';
import Caixa from './Caixa'

import './App.css';

const localhost = 'http://localhost:3001';
const url = 'http://143.255.144.88:3001';
const url_local = 'http://172.16.17.248:3001';
const socket = socketIOClient(localhost, {
      reconnectionAttempts: 5,
    })


let searchCliente = false;

let conns = [];
let clients = [];



const Conections = styled.div`
    position: absolute;
    right: 0;
    width: 404px;
    max-height: 100%;
    margin: 0;
    z-index: 100;
`;
const Clients = styled.div`
    position relative;
    float: left;
    width: 100%;
    height: 100%;
`;

const Input = styled.input`
    width: 200px;
    height: 30px;
    font-size: 15px;
    font-weight: 500;
    color: #CCC;
    margin: 6px;
    border: 1px solid #CCC;
    border-radius: 5px;
    position: absolute;
    left: 0px;
    z-index: 50;
`;

const Main = styled.div`
    width: 100%;
    height: 100%;
    position: fixed;
`;

const Menu = styled.div`
    position absolute;
    width: 452px;
    height: 100%;
    left: ${props => props.open ? '0' : '-452px'};
    border: 1px solid #CCC;
    padding: 2px;
    z-index: 100;
    background-color: #FFF;
    box-shadow: 0 1px 2px rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
    overflow-y: scroll;
    transition-duration: .2s;
    transition-timing-function: cubic-bezier(0,0,.2,1);
`;

function App() {
  const [connections, setConnections] = useState([]);
  const [clientes, setClientes] = useState([]);
  
  const [buscaCliente, setBuscaCliente] = useState("");
  const [caixa, setCaixa] = useState([]);
  const [position, setPosition] = useState({lat: -29.096961149594,lng: -49.641587163935});
  const [marks, setMarks] = useState([]);
  const [caixaData, setCaixaData] = useState(false);
  const [olts, setOlts] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);
  const [menuContent, setMenuContent] = useState(0);
  const firstRenderRef = useRef(true);
  const [scanNumber, setScanNumber] = useState(0);
  const [login, setLogin] = useState(false);
  

  function removeFronConnections(data){
    console.log(data)
    let arr = [...connections]
    let inList = Object.values(arr).findIndex((con, index) => {
      console.log(con)
      if(con.id == data.id){
        return con.id == data.id;
      } 
    });
    if(inList != -1){
      arr.splice(inList, 1);
      conns = arr;
      setConnections([...arr]);
    }
  }

  function insertCLient(data){
    data.map(client => {
      clients.push(client);
    })
    setClientes([...clients]);
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
    console.log(onu)
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

  
  function startListen()
  {
    socket.on('oltData', data => { setOlts([...data]); });

    socket.on('connection', data => {
      inserConnection(data);
    });

    socket.on('scan', data => {
      setScanNumber(data)
    });

    socket.on('cliente', data => {
      openCaixa(2);
      insertCLient(data);
      console.log(data)
    });


  }

  useEffect(async () => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      startListen();
      return;
    }
    
  },[]);

  function busca_cliente(val){
    setBuscaCliente(val);
    if(val != ''){
    clearInterval(searchCliente);
    searchCliente = setTimeout(async() =>{
          setClientes([]);
          socket.emit('cliente', val);
    }, 1000);
    }
    
  }

  function handleDragEnd(event) {
    
    let arr = [...caixa];
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
        setCaixa(arr);
        return;
      }
      if(!arr[over.id - 1].onu) //verifica slot vazio
      {
        if(!isConn())arr[active.id -1].onu = null;
        arr[over.id - 1].onu = active.data.current.onu;
        active.id = over.id;
        active.data.current.onu.login.ftth_porta = over.id;
        active.data.current.onu.login.id_caixa_ftth = caixaData.caixa.id;
        if(isConn()){
          removeFronConnections(active.data.current.onu);
        }
        socket.emit('updatePorta', active.data.current.onu.login);
      }
      setCaixa(arr);
    }
    
  }

  function scan(value){
    socket.emit('startScan', value);
  }

  function openCaixa(content){
    if(!openMenu){
      setOpenMenu(true);
      setMenuContent(content);
      return;
    }
    if(menuContent == content){
      setOpenMenu(false);
      setMenuContent(0);
      return;
    }
    if(openMenu){
        setMenuContent(content);
        return;
    }
  }

  return (
    <>
    <Main>
    <button onClick={() => { openCaixa(1)}}>CAIXA</button>
    <DndContext onDragEnd={handleDragEnd}>
    <Menu open={openMenu}>
    {menuContent == 1 ? (<Caixa 
        socket={socket} 
        setCaixa={setCaixa}
        setCaixaData={setCaixaData}
        setPosition={setPosition}
        setMarks={setMarks}
        caixaData={caixaData}
        caixa={caixa}
        />) : ''}
    {menuContent == 2 ? <Clientes 
    results={clientes}
    buscaClientes={busca_cliente}
    buscaCliente={buscaCliente}
    setPosition={setPosition}
    setMarks={setMarks}
    setLogin={setLogin}
    showDetail={openCaixa}
    /> : ''}
    {menuContent == 3 ? <ClientesData
    login={login}
    socket={socket} 
    /> : ''}
    </Menu>
    <Conections>
    <select onChange={e => {scan(e.target.value)}} className='select-cidade'>
        <option key={-1} value={-1}>Parar</option>
      {olts.map((olt, index) => (
        <option key={index} value={olt.options.idIxc}>{olt.cidade}</option>
      ))}
    </select>
    <div className='scans'>{scanNumber}</div>
    <Clients>
    {connections.map(onu => (
        <LoginDrag id={onu.login?.id ? onu.login.id : onu.macAddress} onu={onu} key={onu.login?.id ? onu.login.id : onu.macAddress} conn={true} ignore={removeFronConnections}/>
      ))}
    </Clients>
    </Conections>
    <Input onChange={(event) => {busca_cliente(event.target.value);} } value={buscaCliente} placeholder='Buscar Cliente' />
    </DndContext>
    <Map pos={position} marks={marks}/>
    
  </Main>
  </>
  )
}

export default App;