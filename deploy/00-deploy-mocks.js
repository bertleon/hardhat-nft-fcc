const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25") // It takes 0.25 Link per request
const GAS_PRICE_LINK = 1e9 // CALCULATED VALUE BASED ON THE CHAIN
const args = [BASE_FEE, GAS_PRICE_LINK]

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        // deploy a mock vrfcoordinator...
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })

        log("Mocks Deployed!")
        log("------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
