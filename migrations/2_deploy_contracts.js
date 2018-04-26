let WellderlyCrowdsale = artifacts.require('./WellderlyCrowdsale.sol')

module.exports = (deployer, network, accounts) => {
  const startTime = Math.round(new Date(Date.now()).getTime() / 1000) // Tomorrow
  const endTime = Math.round((new Date().getTime() + 86400000 * 20) / 1000) // Tomorrow + 20 days
  const rate = new web3.BigNumber(5000) // 1ETH = 5000 WDER
  const goal = new web3.BigNumber(5000000000000000000) // 5 ETH
  const cap = new web3.BigNumber(70000000000000000000) // 70 ETH

  const wallet = network == 'development' ? accounts[9] : accounts[0]
  console.warn('Wallet', wallet)

  deployer.deploy(
    WellderlyCrowdsale,
    startTime,
    endTime,
    rate,
    wallet,
    goal,
    cap
  )
}
