require('dotenv').config()
const mnemonic = process.env.MNEMONIC
const HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, process.env.RINKEBY),
      network_id: 4,
      gas: 6712388
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, process.env.ROPSTEN),
      network_id: 3,
      gas: 4628127
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
