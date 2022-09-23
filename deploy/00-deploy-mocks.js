const { developmentChains, INITIAL_PRICE } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25") // It takes 0.25 Link per request
const GAS_PRICE_LINK = 1e9 // CALCULATED VALUE BASED ON THE CHAIN
const args = [BASE_FEE, GAS_PRICE_LINK]

const DECIMALS = "18"

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        // deploy a mock vrfcoordinator...
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })

        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })

        log("Mocks Deployed!")
        log("------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
