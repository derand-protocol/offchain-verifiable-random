import Web3 from "web3";
import ERC721_ABI from "../../abis/ERC721.json" assert { type: "json" };
import { ADDRESS_ZERO, TOKEN_ADDRESS, RPC_URLS } from "../constants.js";
import { arrayRandomIndex } from "./helper.js";

export const getWeb3 = async () => {
  do {
    const rpc_url = RPC_URLS[arrayRandomIndex(RPC_URLS.length)];
    const web3 = new Web3(rpc_url);
    try {
      await web3.eth.net.isListening();
      return web3;
    } catch (error) {
      console.log(error);
    }
  } while (true);
};

export const isNftMinted = async (id) => {
  try {
    const web3 = await getWeb3();
    const contract = new web3.eth.Contract(ERC721_ABI, TOKEN_ADDRESS);

    const nftOwner = await contract.methods.ownerOf(id).call();
    if (nftOwner && nftOwner != ADDRESS_ZERO) {
      return true;
    }
  } catch (error) {
    console.log(error.message);
  }
  return false;
};

export const getMintEvent = async (txHash) => {
  const web3 = await getWeb3();
  const tx = await web3.eth.getTransactionReceipt(txHash);
  const log = tx.logs[0];
  return web3.eth.abi.decodeLog(
    [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    log.data,
    log.topics
  );
};
