pragma solidity ^0.4.21;

import "./WellderlyToken.sol";
import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol";

contract WellderlyCrowdsale is CappedCrowdsale, RefundableCrowdsale {

  // ICO Stage
  enum CrowdsaleStage { PreICO, ICO }

  CrowdsaleStage public stage = CrowdsaleStage.PreICO;

  // Token Distribution
  uint256 private DECIMALS = 10 ** 18 * 10 ** 6;

  uint256 public maxTokens          = 1000 * DECIMALS;
  uint256 public tokensForEcosystem = 400 * DECIMALS;
  uint256 public tokensForTeam      = 200 * DECIMALS;
  uint256 public tokensForSale      = 400 * DECIMALS;
  uint256 public tokensForPreICO    = 100 * DECIMALS;

  uint256 private ratePreICO  = 5000;
  uint256 private rateICO     = 4000;

  // Amount raised in PreICO
  uint256 public raisedPreICO;

  // Events
  event ETHTransferred(string text);
  event ETHRefunded(string text);

  function WellderlyCrowdsale(
    uint256 _startTime,
    uint256 _endTime,
    uint256 _rate,
    address _wallet,
    uint256 _goal,
    uint256 _cap
  )
  CappedCrowdsale(_cap)
  RefundableCrowdsale(_goal)
  Crowdsale(_startTime, _endTime, _rate, _wallet)
  public {
    require(_goal <= _cap);
  }

  function createTokenContract() internal returns (MintableToken) {
    return new WellderlyToken();
  }

  function setCrowdsaleStage(uint value) public onlyOwner {
    CrowdsaleStage _stage;

    if (uint(CrowdsaleStage.PreICO) == value) {
      _stage = CrowdsaleStage.PreICO;
    } else if(uint(CrowdsaleStage.ICO) == value) {
      _stage = CrowdsaleStage.ICO;
    }

    stage = _stage;

    if(stage == CrowdsaleStage.PreICO) {
      setCurrentRate(ratePreICO);
    } else if(stage == CrowdsaleStage.ICO) {
      setCurrentRate(rateICO);
    }
  }

  function setCurrentRate(uint256 _rate) private {
    rate = _rate;
  }

  function () external payable {
    uint256 newTokens = msg.value.mul(rate);

    if ((stage == CrowdsaleStage.PreICO) && (token.totalSupply() + newTokens > tokensForPreICO)) {
      msg.sender.transfer(msg.value); // Refund them
      emit ETHRefunded("PreICO Limit Hit");
      return;
    }

    buyTokens(msg.sender);

    if(stage == CrowdsaleStage.PreICO) {
      raisedPreICO = raisedPreICO.add(msg.value);
    }
  }

  function forwardFunds() internal {
    if(stage == CrowdsaleStage.PreICO) {
      wallet.transfer(msg.value);
      emit ETHTransferred("Forwarding funds to wallet");
    } else if (stage == CrowdsaleStage.ICO) {
      emit ETHTransferred("Forwarding funds to refundable vault");
      super.forwardFunds();
    }
  }

  function finish(
    address _teamFund,
    address _ecosystemFund) public {
    require(!isFinalized);
    uint256 alreadyMinted = token.totalSupply();
    require(alreadyMinted < maxTokens);

    uint256 unsoldTokens = tokensForSale - alreadyMinted;

    if(unsoldTokens > 0) {
      tokensForEcosystem = tokensForEcosystem + unsoldTokens;
    }

    token.mint(_teamFund, tokensForTeam);
    token.mint(_ecosystemFund, tokensForEcosystem);

    finalize();
  }
}
