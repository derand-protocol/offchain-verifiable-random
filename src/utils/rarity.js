import {
  CHAIN_ID,
  MUON_APP_ID,
  MUON_PUBLIC_KEY,
  TOKEN_ADDRESS,
} from "../constants.js";
import { Rarity } from "../db/models/Rarity.js";
import { randomIntFromInterval } from "./helper.js";
import { MuonApp } from "./muon-helper.js";
import { keyFromPublic, schnorrVerifyWithNonceAddress } from "./tss/index.js";
import { getWeb3 } from "./web3.js";

const RARITY_LENGTH = 5;

const getDerandRandomNumber = async (id) => {
  const muonApp = new MuonApp();
  const web3 = await getWeb3();
  const randomSeed = web3.utils.soliditySha3(
    { type: "uint256", value: CHAIN_ID },
    { type: "address", value: TOKEN_ADDRESS },
    { type: "uint256", value: id }
  );

  const { reqId, signature } = await muonApp.getSignature(randomSeed);

  const hash = web3.utils.soliditySha3(
    { type: "uint256", value: MUON_APP_ID },
    { type: "uint256", value: reqId },
    { type: "string", value: randomSeed }
  );
  if (
    !schnorrVerifyWithNonceAddress(
      hash,
      signature["signature"],
      signature["nonce"],
      keyFromPublic(MUON_PUBLIC_KEY)
    )
  ) {
    throw new Error("Invalid MUON signature");
  }
  return signature["signature"];
};

export const setRarity = async (id) => {
  const randomNumber = await getDerandRandomNumber(id);
  console.log(randomNumber);
  const randomRarity = randomIntFromInterval(1, RARITY_LENGTH);
  console.log(randomRarity);
  await Rarity.updateOne(
    { nftId: id },
    { rarity: randomRarity },
    { runValidators: true, upsert: true, setDefaultsOnInsert: true }
  );
  return randomRarity;
};
