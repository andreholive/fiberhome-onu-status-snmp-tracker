import React, {useState, useEffect, useRef} from 'react';
import {DndContext} from '@dnd-kit/core';
import styled from 'styled-components';
import socketIOClient from 'socket.io-client';
import LoginDrag from './LoginDrag';
import Clientes from './Clientes'
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
  

  function removeFronConnections(data){
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

  function searchConnections(data)
  {
    let inList = Object.values(conns).findIndex((con, index) => {
      if(con.id == data.id){
        return con.id == data.id;
      } 
    });
    return inList;
  }

  

  
  function inserConnection(data){
    console.log(conns)
    const index = searchConnections(data);
    if(index != -1)
    {
      conns[index].onu_data.status = data.onu_data.status;
      conns[index].onu_data.optical = data.onu_data.optical;
      conns[index].ip = data.ip;
      conns[index].mac = data.mac;
      setConnections([...conns]);
    }
    if(index === -1){
      conns.push(data);
      setConnections([...conns]);
    }
  }

  
  function startListen()
  {
    socket.on('oltData', data => { setOlts([...data]); });

    socket.on('connection', data => {
      inserConnection(data);
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
          socket.emit('cliente', val);
    }, 1000);
    }
    
  }

  function handleDragEnd(event) {
    console.log(event.active)
    let arr = [...caixa];
    if(event.over){
      const {over, active} = event;
      if(over.id === active.id){
        return;
      }
      if(over.id === 'trash'){
        arr[active.id -1].login = null;
        setCaixa(arr);
        active.data.current.login.ftth_porta = '';
        active.data.current.login.id_caixa_ftth = '';
        socket.emit('updateLogin', {login: active.data.current.login, porta: over.id});
        return;
      }
    if(!arr[over.id - 1].login){ //verifica slot vazio
      arr[over.id - 1].login = active.data.current.login; //coloca o login no slot
      if(arr[active.id -1]){
        arr[active.id -1].login = null; //limpa login do slot anterior
      }
      active.id = over.id;
      active.data.current.login.ftth_porta = over.id;
      active.data.current.login.id_caixa_ftth = caixaData.caixa.id;
      socket.emit('updateLogin', {login: active.data.current.login, porta: over.id});
      if(active.data.current.isConn){
        removeFronConnections(active.data.current.login) //retira da conexoes
      }
      
    }
    setCaixa(arr);
    }
  }

  function scan(value){
    socket.emit('startScan', value);
  }

  const style = {
    width: '145px',
    height: '30px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#CCC',
    margin: '6px',
    border: '1px solid #CCC',
    borderRadius: '5px'
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
    /> : ''}
    </Menu>
  <Conections>
      <select onChange={e => {scan(e.target.value)}} style={style}>
          <option key={-1} value={-1}>Parar</option>
        {olts.map((olt, index) => (
          <option key={index} value={index}>{olt.cidade}</option>
        ))}
      </select>
      
    <Clients>
    {connections.map(connection => (
        <LoginDrag id={connection.id} item={connection} key={connection.id} conn={true} ignore={removeFronConnections}/>
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