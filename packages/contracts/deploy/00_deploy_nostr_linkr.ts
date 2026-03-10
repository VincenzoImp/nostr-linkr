import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployNostrLinkr: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("NostrLinkr", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const nostrLinkr = await hre.ethers.getContract<Contract>("NostrLinkr", deployer);
  const address = await nostrLinkr.getAddress();
  const owner = await nostrLinkr.owner();

  console.log("\n  NostrLinkr deployed successfully!");
  console.log(`  Address: ${address}`);
  console.log(`  Owner:   ${owner}`);
  console.log(`  Network: ${hre.network.name}`);
  console.log(`  Chain:   ${(await hre.ethers.provider.getNetwork()).chainId}\n`);
};

deployNostrLinkr.tags = ["NostrLinkr"];

export default deployNostrLinkr;
