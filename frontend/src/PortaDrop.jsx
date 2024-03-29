import React from 'react';
import {useDroppable} from '@dnd-kit/core';
import styled from 'styled-components';
import LoginDrag from './LoginDrag';

const Porta = styled.div`
  position: relative;
  float: left;
  width: 430px;
  height: 42px;
  margin: 1px;
  background-color: #CCC;
  border-radius: 6px;
`;
const DropArea = styled.div`
    position relative;
    float: left;
    width: 400px;
    height: 42px;
    background-color: #e9e9e9;
    border-radius: 6px;
`;
const Number = styled.div`
    position: relative;
    float: left;
    width: 20px;
    height: 30px;
    font-size: 20px;
    margin: 13px 2px;
    text-align: center;
`;

export function PortaDrop({id, onu}) {
  const {isOver, setNodeRef} = useDroppable({
    id: id,
    onu: onu,
    
  });
  return (
    <Porta>
    <Number>{id}</Number>
    <DropArea ref={setNodeRef}>
      {onu ? <LoginDrag id={id} onu={onu} key={onu.login.id} conn={false}/> : null}
    </DropArea>
    </Porta>
    
  );
}

export default PortaDrop;