import styled from 'styled-components';
import logo from '../imgs/pontonet.webp'



const Head = styled.div`
    width: 100%;
    height: 100px;
`;

const Header = () => {

return (
    <Head>
    <img src={logo} width={300}/>
    </Head>
  );
};

export default Header;