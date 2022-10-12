import mongoose from "mongoose";

const raritySchema = new mongoose.Schema({
  name: { type: String },
  image: { type: String },
  collection_slug: { type: String },
  trait_count: { type: Number },
  rarity: { type: Number },
  average: { type: Number },
  statistical: { type: Number },
  tokenId: { type: String },
  total_supply: { type: Number },
  rank: { type: Number },
  attributes: {
    type: [
      {
        trait_type: { type: String },
        value: { type: String },
        rarityScore: { type: Number },
        averageScore: { type: Number },
        statisticalScore: { type: Number },
      },
    ],
    default: [],
  },
});

const Rarity = mongoose.model("rarity", raritySchema);

export default Rarity;
