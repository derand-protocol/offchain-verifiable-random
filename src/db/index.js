import mongoose from "mongoose";
import { connect } from "mongoose";
import "dotenv/config";
import shuffle from "shuffle-array";
import { Rarity } from "./models/Rarity.js";

const DB_URL = process.env.DB_URL;

export default {
  init: async () => {
    try {
      mongoose.set("strictQuery", false);
      await connect(DB_URL);
      console.log("DB is Connected...\n");
    } catch (err) {
      console.log(err);
      console.error("DB connection error");
      process.exit(1);
    }
  },

  close: async () => mongoose.connection.close(),

  seed: async () => {
    const recordsCount = await Rarity.countDocuments({});
    if (recordsCount == 0) {
      console.log("Seed DB ....");
      let seedData = [];
      let rarities = [];
      for (let i = 1; i <= 10000; i++) {
        let rarity;
        if (i <= 9000) {
          rarity = 1;
        } else if (i <= 9500) {
          rarity = 2;
        } else if (i <= 9800) {
          rarity = 3;
        } else if (i <= 9930) {
          rarity = 4;
        } else if (i <= 9980) {
          rarity = 5;
        } else if (i <= 10000) {
          rarity = 6;
        }
        rarities.push(rarity);
      }
      shuffle(rarities);
      for (let i = 0; i < 10000; i++) {
        seedData.push({
          autoId: i + 1,
          rarity: rarities[i],
        });
      }
      await Rarity.insertMany(seedData);
    }
  },
};
