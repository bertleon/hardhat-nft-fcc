const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT Unit tests", async function () {
          let basicNft, deployer

          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["basicnft"])
              basicNft = await ethers.getContract("BasicNft")
          })

          describe("constructor", async function () {
              it("intializes NFT correctly", async function () {
                  const numToken = await basicNft.getTokenCounter()
                  const tokenName = await basicNft.name()
                  const tokenSymbol = await basicNft.symbol()

                  assert.equal(numToken.toString(), "0")
                  assert.equal(tokenName, "Dogie")
                  assert.equal(tokenSymbol, "DOG")
              })

              it("mints nft correctly", async () => {
                  const txResponse = await basicNft.mintNft()
                  txResponse.wait(1)
                  const tokenURI = await basicNft.tokenURI(0)
                  const numToken = await basicNft.getTokenCounter()

                  assert.equal(numToken.toString(), "1")
                  assert.equal(tokenURI, await basicNft.TOKEN_URI())
              })
          })
      })
