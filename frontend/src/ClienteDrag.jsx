import React, {useState} from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlug, faUnlink, faSignal, faChevronCircleDown, faTimesCircle, faEthernet, faAudioDescription, faThermometerHalf } from '@fortawesome/free-solid-svg-icons'
import LoginDrag from './LoginDrag';

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

export function ClienteDrag({item}) {
  

  const [isOpen, setIsOpen] = useState(false);
  item.logins.map(login => {
    login.cliente = item;
  })
  
  const styleOpen = isOpen ? {
    transform: 'rotate(180deg)' } : undefined;

  function copy(el){
    let text = document.getElementById(el).innerHTML;
    navigator.clipboard.writeText(text);
  }
  
function openClose(){
  setIsOpen(!isOpen);
}

  return (
    <DragArea isOpen={isOpen}>
           
      <Data>
        <Nome id={item.id} onClick={() => copy(item.id)}>{item.razao}</Nome>
        
        <OpenBtn onClick={() => openClose()}><FontAwesomeIcon style={styleOpen} icon={faChevronCircleDown}/></OpenBtn>
        <ConnInfo>
          <Bairro id={`Bairro${item.id}`} onClick={() => copy(`Bairro${item.id}`)}>
            {item.bairro}
          </Bairro>
        </ConnInfo>
      </Data>
      
    <Details isOpen={isOpen}>
      {item.logins.map(login => (
        <LoginDrag id={login.id} item={login} key={login.id} conn={true} ignore={() => {}}/>
      ))}
    </Details>
    </DragArea>
  );
}

export default ClienteDrag;