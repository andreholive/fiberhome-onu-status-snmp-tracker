const OLTs = [
    {
        id: 0,
        ativo: 1,
        cidade: 'Sombrio',
        options: {
        idIxc: 1,
        ip: '10.2.1.2',
        community: 'adsl',
        port: 161,
        trapPort: 162,
        enableWarnings: true,
        enableLogs: true,
        },
        onus: []
    },
    {
        id: 1,
        ativo: 1,
        cidade: 'Praia Grande',
        options: {
        idIxc: 3,
        ip: '10.2.1.6',
        community: 'adsl',
        port: 161,
        trapPort: 162,
        enableWarnings: true,
        enableLogs: true,
        },
        onus: []
    },
    {
        id: 2,
        ativo: 1,
        cidade: 'São João do Sul',
        options: {
        idIxc: 4,
        ip: '10.2.1.14',
        community: 'adsl',
        port: 161,
        trapPort: 162,
        enableWarnings: true,
        enableLogs: true,
        },
        onus: []
    },
    {
        id: 3,
        ativo: 0,
        cidade: 'Jacinto Machado',
        options: {
        idIxc: 5,
        ip: '10.2.1.10',
        community: 'adsl',
        port: 161,
        trapPort: 162,
        enableWarnings: true,
        enableLogs: true,
        },
        onus: []
    }
]
module.exports = {
    OLTs
}