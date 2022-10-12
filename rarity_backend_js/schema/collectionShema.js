import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    collection_name: { type: String, required: true, trim: true },
    opensea_compatible: { type: Boolean },
    collection_slug: { type: String },
    collection_url: { type: String },
    chain: { type: String, required: true, default: "eth" },
    isVerified: { type: Boolean, default: false },
    isPending: { type: Boolean, default: true },
    isPaymentVerified: { type: Boolean, default: false },
    isValid: { type: Boolean, default: true },
    image_url: { type: String },
    banner_image_url: { type: String },
    email: { type: String },
    website_url: { type: String },
    marketplace_url: { type: String },
    official_twitter_url: { type: String },
    official_discord_url: { type: String },
    official_instagram_url: { type: String },
    description: { type: String },
    status_of_your_project: { type: String },
    maximum_no_of_items: { type: Number },
    collection_blockchain: { type: String },
    collection_contract_address: { type: String },
    token: { type: String },
    sale_start_date: { type: String },
    sale_end_date: { type: String },
    reveal_date: { type: String },
    unit_price: { type: String },
    traits: { type: Object },
    showRecentCollections: { type: Boolean, default: true },
    showCollection: { type: Boolean, default: true },
    headerMenu: { type: Boolean, default: true },
    showNewestCollections: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Collection = mongoose.model("collection", collectionSchema);

export default Collection;
