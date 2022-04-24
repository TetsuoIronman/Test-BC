pragma solidity ^0.5.0;

import './RWD.sol';
import './Tether.sol';

contract DecentralBank {
    string public name = 'Decentral Bank';
    address public owner;
    Tether public tether;
    RWD  public rwd;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;  //has ever staked
    mapping(address => bool) public isStaking;   //is staking atm

    constructor (RWD _rwd, Tether _tether) public {
        rwd = _rwd;
        tether = _tether;
        owner = msg.sender;
    }

    // staking function
    function depositTokens(uint _amount) public {
        require(_amount >0, 'amount cannot be 0');

        // trasfer tether tokens to this contract address for staking
        tether.transferFrom(msg.sender, address(this), _amount);

        // Update staking Balance
        stakingBalance[msg.sender] += _amount;

        // Update array and flags
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // issue reward
    function issueTokens() public {
        require(msg.sender == owner, 'caller must be the owner');
        uint256 rewardRate = 1/uint256(100);

        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            uint256 reward = balance * rewardRate;
            
            if (balance > 0) {
                rwd.transfer(recipient, reward);
                }
        }
    }

    // unstaking
    function unstakeTokens(uint _amount) public {
        uint balance = stakingBalance[msg.sender];
        require(_amount>0, 'amount cannot be 0');
        require(balance>=_amount, 'insufficient staking balance');

        // trasfer tether tokens from this contract address for unstaking
        tether.transfer(msg.sender, _amount);

        // Update staking Balance
        stakingBalance[msg.sender] -= _amount;

        // Update array and flags
        if (stakingBalance[msg.sender]==0) {
            isStaking[msg.sender] = false;
        }
    }


}