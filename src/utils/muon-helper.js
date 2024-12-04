import axios from "axios";
import { MUON_URL, MUON_APP_ID, MUON_EXPLORER_API } from "../constants.js";
import { getWeb3 } from "./web3.js";
import ethSigUtil from "@metamask/eth-sig-util";

class MuonApp {
  async getSignature(randomSeed) {
    // const fee = await muonFeeSignature(CHAIN_ID);

    const requestData = {
      app: "derand_offchain_vrf",
      method: "random-number",
      // fee,
      params: {
        randomSeed,
      },
      mode: "sign",
    };

    const response = await axios.post(MUON_URL, requestData);
    const muonSig = response.data;

    if (!muonSig) {
      throw new Error("Invalid muon response");
    }

    const { success, result } = muonSig;

    if (!success) {
      const reqId = await this.#getLockReqId(randomSeed);
      if (reqId) {
        const muonExplorer = new MuonExplorer(MUON_EXPLORER_API);
        const lockRequest = await muonExplorer.fetchRequest(reqId);
        const { data, signatures } = lockRequest;
        const signature = {
          signature: signatures[0]["signature"],
          owner: signatures[0]["owner"],
          nonce: data["init"]["nonceAddress"],
        };
        return { reqId, signature };
      }
      throw new Error("Unable to retrieve muon signature");
    } else {
      const reqId = result["reqId"];
      const signature = {
        signature: result["signatures"][0]["signature"],
        owner: result["signatures"][0]["owner"],
        nonce: result["data"]["init"]["nonceAddress"],
      };

      return { reqId, signature };
    }
  }

  async #getLockReqId(randomSeed) {
    const response = await axios.get(
      `${MUON_URL}&method=delete-global-memory&params[randomSeed]=${randomSeed}`
    );
    const data = response.data;
    if (!data.success) {
      const { message } = data.error;
      if (message) {
        const matches = message.match(/0x.*/);
        if (matches && matches.length) {
          return matches[0];
        }
      }
    }
    return false;
  }
}

class MuonExplorer {
  constructor(apiUrl) {
    this.apiURL = apiUrl;
  }

  async fetchRequest(requestId) {
    return axios
      .get(`${this.apiURL}/${requestId}`)
      .then(({ data }) => data?.request)
      .catch((e) => undefined);
  }
}

export const muonFeeSignature = async () => {
  const web3 = await getWeb3();

  let timestamp = Math.floor(Date.now());
  let wallet = web3.eth.accounts.privateKeyToAccount(
    `0x${process.env.FEE_DEPOSITER_PK}`
  );

  const address = wallet.address;
  const privateKey = wallet.privateKey.substring(2);

  let eip712TypedData = {
    types: {
      EIP712Domain: [{ name: "name", type: "string" }],
      Message: [
        { type: "address", name: "address" },
        { type: "uint64", name: "timestamp" },
        { type: "uint256", name: "appId" },
      ],
    },
    domain: { name: "Muonize" },
    primaryType: "Message",
    message: { address: address, timestamp, appId: MUON_APP_ID },
  };
  const sign = ethSigUtil.signTypedData({
    privateKey: privateKey,
    data: eip712TypedData,
    version: ethSigUtil.SignTypedDataVersion.V4,
  });

  return {
    spender: wallet.address,
    timestamp,
    signature: sign,
  };
};

export { MuonApp };
