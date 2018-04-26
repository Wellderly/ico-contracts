pragma solidity ^0.4.21;

import "zeppelin-solidity/contracts/token/MintableToken.sol";

contract WellderlyToken is MintableToken {
  string public name = "Wellderly Token";
  string public symbol = "WDER";
  uint8 public decimals = 18;
}
