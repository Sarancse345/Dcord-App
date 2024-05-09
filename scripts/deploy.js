const hre = require("hardhat");
const { ethers, run, network } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const NAME = "Dappcord";
  const SYMBOL = "DC";

  // Deploy code

  const Dappcord = await ethers.getContractFactory("Dappcord");
  const dappcord = await Dappcord.deploy(NAME, SYMBOL);
  await dappcord.deployed();
  console.log("Dappcord deployed to:", dappcord.address);

  // Inititaion for the creation of channels

  const CHANNEL_NAMES = ["General", "Intro", "Jobs"];
  const COSTS = [tokens(1), tokens(0), tokens(0.5)];

  // Create the channels

  for (var i = 0; i < 3; i++) {
    const transaction = await dappcord
      .connect(deployer)
      .createChannel(CHANNEL_NAMES[i], COSTS[i]);
    await transaction.wait();
    console.log(`Channel is created for #${CHANNEL_NAMES[i]}`);
  }

  // Verify the contract
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    Verify(dappcord.address, [NAME, SYMBOL]);
  }
}

const Verify = async (Address, arguments) => {
  try {
    run("verify:verify", {
      address: Address,
      constructorArguments: arguments,
    });
  } catch (e) {
    if (e.message.includes("Contract source code already verified")) {
      console.log("Contract source code already verified");
    } else {
      console.log(e);
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
