const { getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 Link premium per request
const GAS_PRICE_LINK = 1e9 // calculated value based on chain's gas price

module.exports = async function ({ getNamedAccount, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (chainId == 31337) {
        log("Local network detected. Deploying mocks... ")
        // deplot a mock vrfcoordinator
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            lof: true,
            args: args,
        })
        log("Mocks Deployed")
        log("-------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
