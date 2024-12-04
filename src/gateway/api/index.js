import express from "express";
import { validationResult } from "express-validator";

import { validateGetRarity } from "../validators.js";
import { Rarity } from "../../db/models/Rarity.js";
import { setRarity } from "../../utils/rarity.js";
import { METADATA_EXTERNAL_URL, METADATA_ARTS_URL } from "../../constants.js";
import { isNftMinted } from "../../utils/web3.js";

const router = express.Router();

const getNftName = (rarity) => {
  switch (rarity) {
    case "1":
      return "The Blueprint";
    case "2":
      return "The Proton Pistol";
    case "3":
      return "The Plasma Shooter";
    case "4":
      return "The Thermal Equaliser";
    case "5":
      return "The Fusion Blaster";
    case "6":
      return "Intergalactic Journey";
    default:
      return "";
  }
};

const getNftMetadata = (rarity) => ({
  rarity: rarity,
  name: getNftName(rarity),
  description: "",
  external_url: METADATA_EXTERNAL_URL,
  image: `${METADATA_ARTS_URL}/${rarity}-thumbnail.gif`,
  animation_url: `${METADATA_ARTS_URL}/${rarity}.${
    rarity == "1" ? "png" : "gif"
  }`,
  attributes: [{ trait_type: "Type", value: `${rarity}` }],
});

router.get("/:id", validateGetRarity(), async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.json({
      success: false,
      message: "Invalid request",
      data: errors.array(),
    });
    return next();
  }

  const { id } = req.params;

  try {
    let nft = await Rarity.findOne({
      nftId: id,
    });

    if (nft) {
      res.json(getNftMetadata(nft.rarity));
    } else {
      console.log(`API: set rarity for NFT ${id}`);

      if (!(await isNftMinted(id))) {
        throw new Error("NFT has not been minted yet.");
      }

      const rarity = await setRarity(id);
      res.json(getNftMetadata(rarity));
    }
  } catch (error) {
    console.log(error);
    res.json({
      errorMessage: error.toString(),
    });
  }

  next();
});

export default router;
