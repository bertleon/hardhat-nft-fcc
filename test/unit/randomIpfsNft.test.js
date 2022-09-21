const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT Unit tests", async function () {
          let randomIpfsNft, deployer, mintFee, vrfCoordinatorV2Mock

          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["randomipfs", "mocks"])
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
              randomIpfsNft = await ethers.getContract("RandomIpfsNft")
              mintFee = randomIpfsNft.getMintFee()
          })

          describe("constructor", async function () {
              it("intializes random ipfs nft correctly", async function () {
                  const intialTokenCount = await randomIpfsNft.getTokenCounter()
                  assert.equal(intialTokenCount.toString(), "0")
              })
          })

          describe("request nft", async () => {
              it("checks if any eth was sent", async () => {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft_NeedMoreETHSent()"
                  )
              })

              it("checks if enough eth was sent", async () => {
                  await expect(
                      randomIpfsNft.requestNft({ value: "1000000000000000" })
                  ).to.be.revertedWith("RandomIpfsNft_NeedMoreETHSent()")
              })

              it("checks nft request event is emitted", async () => {
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })
          describe("fulfill random words", async () => {
              it("mints NFT after random number is returned", async () => {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNft.tokenURI("0")
                              const tokenCounter = await randomIpfsNft.getTokenCounter()
                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomIpfsNft.getMintFee()
                          const requestNftResponse = await randomIpfsNft.requestNft({
                              value: fee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })

          describe("get breed from modded rng", async () => {
              it("st bernard", async () => {
                  const breedIndex = await randomIpfsNft.getBreedFromModdedRng(60)
                  assert.equal(breedIndex, 2)
              })
              it("shiba inu", async () => {
                  const breedIndex = await randomIpfsNft.getBreedFromModdedRng(15)
                  assert.equal(breedIndex, 1)
              })

              it("pug", async () => {
                  const breedIndex = await randomIpfsNft.getBreedFromModdedRng(5)
                  assert.equal(breedIndex, 0)
              })
              it("out of bounds", async () => {
                  await expect(randomIpfsNft.getBreedFromModdedRng(100)).to.be.revertedWith(
                      "RandomIpfsNft_RangeOutOfBounds()"
                  )
              })
          })
      })
