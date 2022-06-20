import React, {useState, useEffect, useRef} from 'react';
import {DndContext} from '@dnd-kit/core';
import Menu from './Menu';
import MenuMonitor from './MenuMonitor'
import './main.css'
import startSocket from  './websocket/websocket';
import startHandlers from './caixa/handleOnDragEnd';

function Main() {
    const [socket, setSocket] = useState(false);
    const [handler, setHandler] = useState(false)
    
    useEffect(()=> {
        if(!socket)setSocket(startSocket());
        if(!handler && socket)setHandler(startHandlers({socket}));
    },[socket]);

    return (
        <div className='main'>
            <DndContext onDragEnd={(e) => handler.handleDragEnd(e)} >
                <Menu socket={socket} handler={handler}/>
                <MenuMonitor socket={socket} handler={handler}/>
            </DndContext>
        </div>
    )
}

export default Main;
