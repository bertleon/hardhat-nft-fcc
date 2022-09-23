const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let ethUsdPriceFeedAddress

    chainId = network.config.chainId

    log("------------------------")
    if (developmentChains.includes(network.name)) {
        log("Getting Aggregator ... ")
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf-8" })
    const highSvg = await fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf-8" })

    args = [ethUsdPriceFeedAddress, lowSvg, highSvg]

    log("Deploying Dynamic SVG NFT")

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("Dynamic SVG NFT Deployed Successfully")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicSvgNft.address, args)
    }
}

module.exports.tags = ["all", "dynamicsvg", "main"]
