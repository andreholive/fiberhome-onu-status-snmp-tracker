import styled from 'styled-components';


const url = "http://127.0.0.1:3001/api"

const Card = styled.div`
    background-color: ${props => props.online === 1 ? "green" : "red"};
    width: 400px;
    height: 100px;
    margin: 2px;
    align-self: center;
    text-align: center;
`;

const Name = styled.div`
    width: 100%;
    height: 30px;
    font-size: 20px;
`;
const LoginName = styled.div`
    position: relative;
    float: left;
    width: 50%;
    height: 15px;
    font-size: 15px;
`;
const Bairro = styled.div`
    position: relative;
    float: left;
    width: 50%;
    height: 15px;
    font-size: 15px;
`;

const Motivo = styled.div`
    position: relative;
    float: left;
    width: 50%;
    height: 15px;
    font-size: 15px;
`;
const Sinal = styled.div`
    position: relative;
    float: left;
    width: 50%;
    height: 15px;
    font-size: 15px;
`;

const Login = ({
    nome, status, login, bairro, slot, pon, fhtt
}) => {

return (
    <>
    <Card online={status}>
        <Name>{nome}</Name>
        <LoginName>{login}</LoginName>
        <Bairro>{bairro}</Bairro>
        <Motivo>Slot: {slot} Pon: {pon}</Motivo>
        <Sinal>{fhtt}</Sinal>
    </Card>
    </>
  );
};

export default Login;
