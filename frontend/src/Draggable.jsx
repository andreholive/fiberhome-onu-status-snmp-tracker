import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import styled from 'styled-components';

const DragArea = styled.div`
    position relative;
    float: left;
    width: 390px;
    height: 40px;
    border: 1px solid #000;
    margin: 5px
`;

export function Draggable({id, item}) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: id,
    data: {
      login: item,
    }
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  return (
    <DragArea ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {item.login.login ? item.login.login : item.login}
    </DragArea>
  );
}

export default Draggable;