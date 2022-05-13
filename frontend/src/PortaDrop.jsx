import React from 'react';
import {useDroppable} from '@dnd-kit/core';
import styled from 'styled-components';
import LoginDrag from './LoginDrag';

const Porta = styled.div`
  position: relative;
  float: left;
  width: 430px;
  height: 56px;
  border: 1px solid #CCC;
  margin: 1px;
  background-color: #CCC;
  border-radius: 6px;
`;
const DropArea = styled.div`
    position relative;
    float: left;
    width: 400px;
    height: 50px;
    border: 1px solid #6e6e6e;
    margin: 2px;
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

export function Droppable({id, item}) {
  const {isOver, setNodeRef} = useDroppable({
    id: id,
  });
  return (
    <Porta>
    <Number>{id}</Number>
    <DropArea ref={setNodeRef}>
      {item ? <LoginDrag id={item.ftth_porta} item={item} key={item.id} conn={false}/> : null}
    </DropArea>
    </Porta>
    
  );
}

export default Droppable;