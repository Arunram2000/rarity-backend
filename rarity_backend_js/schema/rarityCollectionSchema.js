import mongoose from "mongoose";

const rarityCollectionSchema = new mongoose.Schema({
  collectionName: { type: String },
  allTraits: { type: Object },
  traitCount: { type: Object },
});

const RarityCollection = mongoose.model(" rarityCollection", rarityCollectionSchema);

export default RarityCollection;
