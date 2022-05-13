import React from 'react';

import { Droppable } from 'react-beautiful-dnd';

const Porta_Caixa = ({
    porta
}) => {
    console.log(porta)
return (
    <Droppable droppableId={porta}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          
        ></div>
        )}
    </Droppable>
  );
};

export default Porta_Caixa;
