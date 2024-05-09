const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Dappcord", function () {
  let deployer, user;
  let dappcord;
  const NAME = "Dappcord";
  const SYMBOL = "DC";

  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();
    //Deploying the contract
    const Dappcord = await ethers.getContractFactory("Dappcord");
    dappcord = await Dappcord.deploy(NAME, SYMBOL);
    const transaction = await dappcord
      .connect(deployer)
      .createChannel("general", tokens(1));
    await transaction.wait();
  });

  describe("Deployment", function () {
    it("Sets the name", async () => {
      //fetch the name
      let result = await dappcord.name();
      // Check the name
      expect(result).to.equal(NAME);
    });

    it("Sets the symbol", async () => {
      //Fetch the symbol
      let result = await dappcord.symbol();
      // Check the symbol
      expect(result).to.equal(SYMBOL);
    });

    it("Sets the owner", async () => {
      //Fetch the symbol
      const result = await dappcord.owner();
      // Check the symbol
      expect(result).to.equal(deployer.address);
    });
  });

  describe("Creating  channels", function () {
    it("Checking the total channels ", async () => {
      const Totalchannels = await dappcord.totalChannels();
      expect(Totalchannels).to.equal(1);
    });

    it("Checking the getChannel function  ", async () => {
      const checkGetChannel = await dappcord.getChannel(1);
      expect(checkGetChannel.name).to.equal("general");
      expect(checkGetChannel.id).to.equal(1);
      expect(checkGetChannel.cost).to.equal(tokens(1));
    });
  });

  describe("Joining the channel", () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");

    beforeEach(async () => {
      const transaction = await dappcord
        .connect(user)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();
    });

    it("Joins the user ", async () => {
      const result = await dappcord.hasJoined(ID, user.address);
      expect(result).to.equal(true);
    });

    it("Increases total supply ", async () => {
      const result = await dappcord.totalSupply();
      expect(result).to.equal(ID);
    });

    it("Update the contract balance ", async () => {
      const result = await ethers.provider.getBalance(dappcord.address);
      expect(result).to.equal(AMOUNT);
    });
  });

  describe("Withdrawing", () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseUnits("10", "ether");
    let balanceBefore;

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      let transaction = await dappcord
        .connect(user)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();

      transaction = await dappcord.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the correct Balance ", async () => {
      const result = await ethers.provider.getBalance(dappcord.address);
      expect(result).to.equal(0);
    });
  });
});
