const snmp = require('./server_pack');

module.exports = class User{
    constructor(data){
        this.socket = data.socket;
        this.olts = data.olts;
        this.scanning = false;
        this.test = 1;
        this.inDatas();
    }

    async envia(d){
        this.socket.emit(d.type, d.data);
    }

    async inDatas(){
        console.log('User Conected!')
        this.socket.on('startScan', async (num) => { //RECEBE COMANDO PARA INICIAR O SCAN DAS ONUS
            if(num != -1){
                this.startScan(this.olts[num]);
            }
            else{
                this.stopScan();
            }
        });
        this.socket.on('caixa', async (data) => {
            const res = await snmp.busca_caixa(data, this.olts);
            this.socket.emit('caixa', res);
        });
    }

    async startScan(olt) // CHAMA O INICIO DO SCAN E MANTEM O STATUS TRUE DO SCANING
    {  
        await olt.updateOnuStatus();
        this.scanning = true;
        this.scan(olt);
    }

    stopScan() // PARA O SCAN
    { 
        this.scanning = false;
        this.test = 1;
    }

    async scan(olt){ //INICIA O SCAN E MANTEM ATÉ QUE SEJA PARADO
        console.log('Scanning', this.test)
        this.test++;
        const exec = async i =>{
            if(this.scanning && olt.onus && i < Object.keys(olt.onus).length){
                await olt.checkOnuStatus(olt.onus[i], async () => await exec(i+1), async () => this.scan(olt), async (data) => {this.envia(data)})
            } 
                
        }
        await exec(0)
    }

    
    
}