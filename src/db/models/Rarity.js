import { Schema, model } from "mongoose";

const RaritySchema = new Schema({
  nftId: { type: String, require: true, unique: true },
  rarity: { type: String },
});

export const Rarity = model("Rarity", RaritySchema);
