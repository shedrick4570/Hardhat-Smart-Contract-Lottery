const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("1")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId

    if (chainId == 31337) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const transactionResponse = await VRFCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.events[0].args.subId
        // Fund the subscription
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const gasLimit = networkConfig[chainId]["gasLimit"]
    const interval = networkConfig[chainId]["keepersUpdateInterval"]
    const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, gasLimit, interval]
    const lottery = await deploy("Lottery", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    //if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //    log("Verifying...")
    //    await verify(raffle.address, args)
    //}
    if (chainId == 31337) {
        const vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock")
        await vrfCoordinatorV2.addConsumer(subscriptionId, lottery.address)
    }

    log("-------------------------------")
}

module.exports.tags = ["all", "lottery"]
