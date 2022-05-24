import React, {useState, useEffect} from 'react';
import styled from 'styled-components';


function ClientesData({login, socket}) {

const [loginData, setLoginData] = useState(false);

useEffect(async () => {
    socket.on('login', data => {
        setLoginData(data);
        console.log(data)
    });
    socket.emit('findOnu', {id_transmissor: login.id_transmissor, onu_mac: login.onu_mac});
},[]);

return (
    <>
        {loginData?.onuId}
    </>
  )
}

export default ClientesData;