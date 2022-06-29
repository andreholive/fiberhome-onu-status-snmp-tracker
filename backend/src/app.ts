import express from 'express';

class AppController {
    express: any;
    constructor(){
        this.express = express();

        this.middlewares();
    }

    middlewares(){
        this.express.use(express.json());
    }

    routes(){

    }
}

export default new AppController().express;