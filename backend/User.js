const snmp = require('./server_pack');

module.exports = class User{
    constructor(data){
        this.id = data.socket.conn.id;
        this.socket = data.socket;
        this.olts = data.olts;
        this.scanning = false;
    }

    startScan(num){
        console.log('User '+this.id+' INICIOU scan na Olt de '+this.olts[num].cidade)
        this.scanning = num;
        this.olts[num].startScan(this)
    }

    stopScan(){
        if(this.scanning){
            console.log('User '+this.id+' PAROU scan na Olt de '+this.olts[this.scanning].cidade)
            this.olts[this.scanning].stopScan(this);
            this.scanning = false;
        }
        
    }
}