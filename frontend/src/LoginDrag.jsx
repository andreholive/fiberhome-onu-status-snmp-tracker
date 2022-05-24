import React, {useState} from 'react';
import {useDraggable} from '@dnd-kit/core';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlug, faUnlink, faSignal, faChevronCircleDown, faTimesCircle, faEthernet, faAudioDescription, faThermometerHalf } from '@fortawesome/free-solid-svg-icons'

const DragArea = styled.div`
    position relative;
    float: left;
    width: 390px;
    height: ${props => props.isOpen ? '200px' : '40px'};
    border: 1px solid #000;
    margin: 5px;
    background-color: #FFF;
    z-index: 200;
    border-radius: 4px;
`;

const Status = styled.div`
    background-color: ${props => props.status === 1 ? 'green' : 'red'};
    position relative;
    float: left;
    width: 36px;
    height: 10px;
    border-radius: 4px;
`;
const Data = styled.div`
    position relative;
    float: left;
    width: 300px;
    height: 38px;
    margin: 2px;
`;
const Nome = styled.strong`
    position relative;
    float: left;
    width: 260px;
    height: 18px;
    font-size: 14px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;
const ConnInfo = styled.div`
    position relative;
    float: left;
    width: 315px;
    height: 18px;
`;
const Login = styled.span`
    font-size: 10px;
    color: ${props => props.status === 1 ? 'green' : 'red'};
`;
const Bairro = styled.span`
    margin-left: 4px; 
    font-size: 11px;
    font-weight: 500;
`;
const Fhtt = styled.span`
    margin-left: 4px; 
    font-size: 12px;
    text-transform: uppercase;
    font-style: italic;
`;
const StatusIcon = styled.span`
    color: ${props => props.status == 1 ? 'green' : 'red'};
    margin-left: 4px;
`;
const Connection = styled.div`
    position relative;
    float: left;
    width: 36px;
    height: 30px;
    margin: 2px;
    border 1px solid #CCC;
    padding: 2px;
`;
const SlotPon = styled.div`
    position relative;
    float: left;
    width: 36px;
    height: 11px;
    font-size: 9px;
`;
const DragHandle = styled.div`
position: relative;
float: left;
width: 16px;
height: 20px;
padding: 10px 5px;
`;

const IgnoreBtn = styled.div`
position: relative;
float: left;
width: 16px;
height: 18px;
cursor: pointer;
margin-left: 4px;
font-size: 12px;
`;

const OpenBtn = styled.div`
position: relative;
float: left;
width: 16px;
height: 18px;
cursor: pointer;
margin-left: 4px;
font-size: 12px;
`;

const Details = styled.div`
position: relative;
float: left;
width: 380px;
height: 150px;
margin: 4px;
display: ${props => props.isOpen ? 'block' : 'none'};
`;

export function LoginDrag({id, onu, conn, ignore}) {
const {attributes, listeners, setNodeRef, transform} = useDraggable({
  id: id,
  data: {
    onu: onu,
    isConn: conn
  }
});

const [isOpen, setIsOpen] = useState(false);
  
const style = transform ? {
  transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
} : undefined;

const styleOpen = isOpen ? {
  transform: 'rotate(180deg)' } : undefined;

function copy(el){
  let text = document.getElementById(el).innerHTML;
  navigator.clipboard.writeText(text);
}

function getLoginId(id){
  navigator.clipboard.writeText(id);
}

function getState(){
  switch (onu.status) {
      case 0:
          return faUnlink;
      case 1:
          return faSignal;
      case 2:
          return faPlug;
      default:
          return 'Status';
  }
}

function getTitleStatus(){
    switch (onu.status) {
      case 0:
          return 'LOS';
      case 1:
          return `${onu.optical?.rxPower.value} ${onu.optical?.rxPower.unit}`;
      case 2:
          return 'Sem Energia';
      default:
          return 'Status';
  }
}

function getBairro(){
  if(onu.login?.bairro){
    return onu.login.bairro;
  }
  if(onu.cliente?.bairro){
    return onu.cliente.bairro;
  }
  return ''
}

function openClose(){
  setIsOpen(!isOpen);
}

  return (
    <DragArea ref={setNodeRef} style={style} isOpen={isOpen}>
      <Connection onClick={() => getLoginId(onu.login.id)}>
        <Status status={onu.status}/>
        <SlotPon>Slot: {onu.slot}</SlotPon>
        <SlotPon>Pon: {onu.pon}</SlotPon>
      </Connection>
      
      <Data>
        <Nome id={id} onClick={() => copy(id)}>{onu.cliente ? onu.cliente.razao : 'SEM REGISTRO'}</Nome>
        
        <OpenBtn onClick={() => openClose()}><FontAwesomeIcon style={styleOpen} icon={faChevronCircleDown}/></OpenBtn>
        <IgnoreBtn onClick={() => ignore(onu.login)}><FontAwesomeIcon icon={faTimesCircle}/></IgnoreBtn>
        <ConnInfo>
          <Login status={onu.status} id={`Longin${id}`} onClick={() => copy(`Longin${id}`)}>
            {onu.login ? onu.login.login : 'sem login'}
          </Login>
          <Bairro id={`Bairro${id}`} onClick={() => copy(`Bairro${id}`)}>
            {getBairro()}
          </Bairro>
          <Fhtt id={`Fhtt${id}`} onClick={() => copy(`Fhtt${id}`)}>
          {onu.macAddress}
          </Fhtt>
          <StatusIcon status={onu.status}>
           <FontAwesomeIcon icon={getState()} title={getTitleStatus()}/>
          </StatusIcon>
          
        </ConnInfo>
      </Data>
      <DragHandle {...listeners} {...attributes}>
        <svg viewBox="0 0 20 20" width="20">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
      </svg>
      </DragHandle>
      
    <Details isOpen={isOpen}>
    <FontAwesomeIcon icon={faEthernet}/>{onu.macAddress}<br/>
    <FontAwesomeIcon icon={faAudioDescription}/>{onu.login?.ip ? onu.login.ip : ''}<br/>
    <FontAwesomeIcon icon={getState()}/>{getTitleStatus()}<br/>
    <FontAwesomeIcon icon={faPlug}/>{`${onu.optical ? onu.optical.voltage.value : ''} ${onu.optical ? onu.optical.voltage.unit : ''}`}<br/>
    <FontAwesomeIcon icon={faThermometerHalf}/>{`${onu.optical ? onu.optical.temperature.value : ''} ${onu.optical ? onu.optical.temperature.unit : ''}`}<br/>
    </Details>
    </DragArea>
  );
}

export default LoginDrag;