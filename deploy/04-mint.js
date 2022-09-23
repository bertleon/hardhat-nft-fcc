const { ethers, network } = require("hardhat")
const { resolve } = require("path")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()

    const basicNft = await ethers.getContract("BasicNft", deployer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()

    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)

    await new Promise(async (resolve, reject) => {
        console.log("Enter promise")
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000)
        randomIpfsNft.once("NftMinted", async () => {
            resolve()
        })

        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })

    console.log("Exit promise")

    console.log(`RAndom IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)

    const highValue = ethers.utils.parseEther("4000")
    dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString())
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 is tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)
}

module.exports.tags = ["all", "mint"]
