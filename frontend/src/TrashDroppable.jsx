import React from 'react';
import {useDroppable} from '@dnd-kit/core';
import styled from 'styled-components';

const DropArea = styled.div`
    position relative;
    float: left;
    width: 100px;
    height: 40px;
`;

export function TrashDroppable(props) {
  const {isOver, setNodeRef} = useDroppable({
    id: 'trash',
  });
  const style = {
    backgroundColor: isOver ? 'green' : 'red',
  };

  const style2 = isOver ? {
    transform: `rotate(-45deg)`,
    transition: 'transform 250ms'
  } : undefined;
  
  transform: ;
  return (
    <DropArea ref={setNodeRef}>
	    <span className="trash">
    	<span style={style2}></span>
    	<i></i>
      </span>
    </DropArea>
  );
}

export default TrashDroppable;