const WellderlyCrowdsale = artifacts.require('WellderlyCrowdsale')
const WellderlyToken = artifacts.require('WellderlyToken')

//const chai = require('chai')
//const chaiPromised = require('chai-as-promised')
//const BigNumber = require('chai-bignumber')

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')())
  .should()

contract('WellderlyCrowdsale', accounts => {
  it('should deploy the token and store the address', done => {
    WellderlyCrowdsale.deployed().then(async instance => {
      const token = await instance.token.call()
      assert(token, 'Token address couldnt be stored')
      done()
    })
  })

  it('should set stage to PreICO', done => {
    WellderlyCrowdsale.deployed().then(async instance => {
      await instance.setCrowdsaleStage(0)
      const stage = await instance.stage.call()
      assert.equal(stage.toNumber(), 0, 'The stage could be set to PreICO')
      done()
    })
  })

  it('1 ETH should buy 5000 Wellderly Tokens in PreICO', done => {
    WellderlyCrowdsale.deployed().then(async instance => {
      await instance.sendTransaction({
        from: accounts[7],
        value: web3.toWei(1, 'ether')
      })
      const tokenAddress = await instance.token.call()
      const token = WellderlyToken.at(tokenAddress)
      const tokenAmount = await token.balanceOf(accounts[7])
      assert.equal(
        tokenAmount.toNumber(),
        5000 * 10 ** 18,
        "The sender didn't receive the tokens as per PreICO rate"
      )
      done()
    })
  })

  it('should transfer the ETH to wallet immediately in Pre ICO', done => {
    WellderlyCrowdsale.deployed().then(async instance => {
      let balanceOfBeneficiary = await web3.eth.getBalance(accounts[9])
      balanceOfBeneficiary = Number(balanceOfBeneficiary.toString(10))

      await instance.sendTransaction({
        from: accounts[1],
        value: web3.toWei(2, 'ether')
      })

      let newBalanceOfBeneficiary = await web3.eth.getBalance(accounts[9])
      newBalanceOfBeneficiary = Number(newBalanceOfBeneficiary.toString(10))

      assert.equal(
        newBalanceOfBeneficiary,
        balanceOfBeneficiary + 2 * 10 ** 18,
        'ETH couldnt be transferred to the beneficiary'
      )
      done()
    })
  })

  it('should set variable `raisedPreICO` correctly', done => {
    WellderlyCrowdsale.deployed().then(async instance => {
      var amount = await instance.raisedPreICO.call()
      assert.equal(
        amount.toNumber(),
        web3.toWei(3, 'ether'),
        'Total ETH raised in PreICO was not calculated correctly'
      )
      done()
    })
  })

  it('should set stage to ICO', done => {
    WellderlyCrowdsale.deployed().then(async instance => {
      await instance.setCrowdsaleStage(1)
      const stage = await instance.stage.call()
      assert.equal(stage.toNumber(), 1, "The stage couldn't be set to ICO")
      done()
    })
  })

  it('1 ETH should by 4000 Wellderly Tokens in ICO', done => {
    WellderlyCrowdsale.deployed().then(async instance => {
      await instance.sendTransaction({
        from: accounts[2],
        value: web3.toWei(1.5, 'ether')
      })
      const tokenAddress = await instance.token.call()
      const token = WellderlyToken.at(tokenAddress)
      const tokenAmount = await token.balanceOf(accounts[2])
      assert.equal(
        tokenAmount.toNumber(),
        6000 * 10 ** 18,
        "The sender didn't receive the tokens as per ICO rate"
      )
      done()
    })
  })

  it('should transfer the raised ETH to RefundVault during ICO', done => {
    WellderlyCrowdsale.deployed().then(async instance => {
      var vaultAddress = await instance.vault.call()

      let balance = await web3.eth.getBalance(vaultAddress)

      assert.equal(
        balance.toNumber(),
        1500000000000000000,
        "ETH couldn't be transferred to the vault"
      )
      done()
    })
  })

  it.skip('Vault balance should be added to our wallet once ICO is over', done => {
    WellderlyCrowdsale.deployed().then(async instance => {
      let balanceOfBeneficiary = await web3.eth.getBalance(accounts[9])
      balanceOfBeneficiary = balanceOfBeneficiary.toNumber()

      var vaultAddress = await instance.vault.call()
      let vaultBalance = await web3.eth.getBalance(vaultAddress)

      await instance.finish(accounts[0], accounts[1], accounts[2])

      let newBalanceOfBeneficiary = await web3.eth.getBalance(accounts[9])
      newBalanceOfBeneficiary = newBalanceOfBeneficiary.toNumber()

      assert.equal(
        newBalanceOfBeneficiary,
        balanceOfBeneficiary + vaultBalance.toNumber(),
        "Vault balance couldn't be sent to the wallet"
      )
      done()
    })
  })
})
