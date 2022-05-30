import React, {useState} from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronCircleDown, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons'

const Cliente = styled.div`
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

function ResultCliente({cliente}) {

const logins = cliente.logins;
const [isOpen, setIsOpen] = useState(false);
 

const styleOpen = isOpen ? {
    transform: 'rotate(180deg)' } : undefined;

 return (
      <Cliente key={cliente.id} isOpen={isOpen}>
      {logins?.length > 1 ? <OpenBtn><FontAwesomeIcon style={styleOpen} icon={faChevronCircleDown}/></OpenBtn> : ''}
      <div>{cliente.razao}</div>
      {logins?.length > 1 ? <Details isOpen={isOpen} /> : ''}
      {logins?.length == 1 ? <FontAwesomeIcon style={styleOpen} icon={faArrowAltCircleRight}/> : ''}
      
      </Cliente>
        
  )
}

export default ResultCliente;