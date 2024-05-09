// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Dappcord is ERC721 {
    address public owner;

    //code goes here...
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(uint256 => Channel) public channels;
    uint256 public totalChannels;
    uint256 public totalSupply;

    struct Channel {
        uint256 id;
        string name;
        uint256 cost;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        // more code goes here...
        owner = msg.sender;
    }

    function createChannel(string memory _name, uint256 _cost) public onlyOwner {
        totalChannels++;
        channels[totalChannels] = Channel(totalChannels, _name, _cost);
    }

    function mint(uint256 _id)public payable {
        require(_id!=0);
        require(_id <= totalChannels, "Invalid Channel ID");
        require(hasJoined[_id][msg.sender] == false, "You have already joined this channel!");
        require(msg.value >= channels[_id].cost, "Invalid amount");
        // Join channnels
         hasJoined[_id][msg.sender] = true;

        // Mint the tokens 
        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function getChannel(uint256 _id) public view returns (Channel memory) {
        return channels[_id];
    }
    function withdraw() public onlyOwner {
        (bool callSuccess , ) = payable(owner).call{value : address(this).balance}("");
        require(callSuccess, "Withdrawing failed");
    }
    modifier onlyOwner(){
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}
