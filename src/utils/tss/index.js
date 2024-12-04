import ethJsUtil from "ethereumjs-util";
import Web3 from "web3";
import elliptic from "elliptic";
import numberToBN from "number-to-bn";

const {
  utils: { randomHex, sha3, soliditySha3, keccak256 },
} = Web3;

function toBN(number) {
  try {
    return numberToBN.apply(null, arguments);
  } catch (e) {
    throw new Error(e + ' Given value: "' + number + '"');
  }
}

const EC = elliptic.ec;
const curve = new EC("secp256k1");
const HALF_N = curve.n.shrn(1).addn(1);
/**
 * Let H be elements of G, such that nobody knows log, h
 * used for pedersen commitment
 * @type {Point}
 */
// const H = new Point(
//   '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
//   '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'
// );
const H = curve
  .keyFromPublic(
    "04206ae271fa934801b55f5144bec8416be0b85f22d452ad410f3f0fca1083dc7ae41249696c446f8c5b166760377115943662991c35ff02f9585f892970af89ed",
    "hex"
  )
  .getPublic();

export const keyFromPublic = function (pubKeyStr, encoding = "hex") {
  return curve.keyFromPublic(pubKeyStr, encoding).getPublic();
};

export function validatePublicKey(publicKey) {
  if (typeof publicKey === "string") publicKey = keyFromPublic(publicKey);
  return curve.curve.validate(publicKey);
}

export function schnorrVerifyWithNonceAddress(
  hash,
  signature,
  nonceAddress,
  signingPubKey
) {
  nonceAddress = nonceAddress.toLowerCase();
  signature = toBN(signature).umod(curve.n);

  if (!validatePublicKey(signingPubKey)) return false;

  if (toBN(nonceAddress).isZero() || signature.isZero() || toBN(hash).isZero())
    return false;

  // @ts-ignore
  const e = toBN(schnorrHash(signingPubKey, nonceAddress, hash));

  let recoveredPubKey = ethJsUtil.ecrecover(
    curve.n
      .sub(signingPubKey.getX().mul(signature).umod(curve.n))
      .toBuffer("be", 32),
    signingPubKey.getY().isEven() ? 27 : 28,
    signingPubKey.getX().toBuffer("be", 32),
    e.mul(signingPubKey.getX()).umod(curve.n).toBuffer("be", 32)
  );
  const addrBuf = ethJsUtil.pubToAddress(recoveredPubKey);
  const addr = ethJsUtil.bufferToHex(addrBuf);

  return nonceAddress === addr;
}

function toChecksumAddress(address) {
  address = address.toLowerCase().replace(/^0x/i, "");
  let hash = keccak256(address).replace(/^0x/i, "");
  let ret = "0x";
  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }
  return ret;
}

export const pub2addr = function (publicKey) {
  let pubKeyHex = publicKey.encode("hex").substr(2);
  // @ts-ignore
  let pub_hash = keccak256(Buffer.from(pubKeyHex, "hex"));
  return toChecksumAddress("0x" + pub_hash.substr(-40));
};

export function schnorrHash(signingPublicKey, nonceTimesGeneratorAddress, msg) {
  let totalBuff = Buffer.concat([
    /** signingPubKeyX */
    signingPublicKey.getX().toBuffer("be", 32),
    /** pubKeyYParity */
    Buffer.from(signingPublicKey.getY().isEven() ? "00" : "01", "hex"),
    /** msg hash */
    Buffer.from(msg.replace(/^0x/i, ""), "hex"),
    /** nonceGeneratorAddress */
    Buffer.from(nonceTimesGeneratorAddress.replace(/^0x/i, ""), "hex"),
  ]);
  // @ts-ignore
  return keccak256(totalBuff);
}

function splitSignature(signature) {
  const bytes = signature.replace("0x", "");
  if (bytes.length !== 128) throw `invalid schnorr signature string`;
  return {
    e: toBN(`0x${bytes.substr(0, 64)}`),
    s: toBN(`0x${bytes.substr(64, 64)}`),
  };
}

function pointAdd(point1, point2) {
  // if a point is null then return another one as the result of the addition
  if (point1 === null) {
    return point2;
  }
  if (point2 === null) {
    return point1;
  }
  // calculate the addition of the points
  const result = point1?.add(point2);

  // if any of the input points are not valid elliptic curve points return generator as output
  if ((point1.validate() && point2.validate()) === false) {
    return curve.g;
  } else {
    return result;
  }
}

export const schnorrVerify = function (pubKey, msg, sig) {
  if (typeof sig === "string") {
    sig = splitSignature(sig);
  }

  // Prevent denial of service attacks by bounding the 's' and 'e' to values lower than curve.n
  const s = sig.s.umod(curve.n);
  const e = sig.e.umod(curve.n);

  // Calculate verifying values of signature use public key as part of challenge hash
  const rv = pointAdd(curve.g.mul(s), pubKey.mul(e));
  const ev = schnorrHash(rv, pubKey, msg);
  const result = toBN(ev).eq(e);

  // Return only if the public key value is a valid point on curve
  if (pubKey.validate() === false) {
    return false;
  } else {
    return result;
  }
};
