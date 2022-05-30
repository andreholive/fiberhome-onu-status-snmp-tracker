import React, {useState, useEffect, useRef} from 'react';
import Caixa from './caixa/Caixa';
import Cliente from './cliente/Clientes';

import './main.css'


function Menu({socket, handler}) {

    const [searchType, setSearchType] = useState('cliente');
    const [searchText, setSearchText] = useState('');

    function handleKeyPress(event){
        if(event.key === 'Enter')search();
    }

    function search(){
        socket.emit(searchType, searchText);
    }

    return (
        
        <div className='menu'> 
            <input type='checkbox' id='toggle' />
            <label className='wrapper_button' htmlFor='toggle'></label>
            <div className='menu_content'>
                <div className='search_bar'>
                    <select id='search_type' value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                        <option value='cliente'>Cliente</option>
                        <option value='caixa'>Caixa</option>
                    </select>
                    <input type='text' id='search' value={searchText} onKeyPress={(e) => handleKeyPress(e)} onChange={(e) => setSearchText(e.target.value)}/>
                </div>
                {searchType == 'caixa' ?
                <Caixa socket={socket} handler={handler}/> : null}
                {searchType == 'cliente' ?
                <Cliente socket={socket} handler={handler}/> : null}
            </div>              
        </div>
        
    )
}

export default Menu;