import Moralis from "moralis/node.js";

import { API } from "../api/index.js";
import Collection from "../schema/collectionShema.js";
import RarityCollection from "../schema/rarityCollectionSchema.js";

const serverUrl = "https://varzkk0evwit.usemoralis.com:2053/server";
const appId = "0kfAupQphG55NcYoOHoIaq68knWSvWD4D3XmacLM";
Moralis.start({ serverUrl, appId });

export const getCollection = async (req, res) => {
  const { collection_slug } = req.params;
  let stats = null;
  try {
    const collectionData = await Collection.findOne({ collection_slug });

    if (collectionData.chain === "eth") {
      try {
        const { data } = await API.get(`/collection/${collection_slug}/stats`);
        if (data.success === false) stats = null;
        else stats = data.stats;
      } catch (error) {
        stats = null;
      }
    }

    const slug = collection_slug?.includes("-")
      ? collection_slug?.split("-")?.join("_")
      : collection_slug;

    const collectionDetails = await RarityCollection.findOne({ collectionName: slug });

    const result = {
      ...collectionData._doc,
      stats,
      allTraits: collectionDetails.allTraits,
      traitCount: collectionDetails.traitCount,
    };

    res.json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const getCollectionStats = async (req, res) => {
  const { collection_slug } = req.params;
  try {
    const { data } = await API.get(`/collection/${collection_slug}/stats`);

    return res.json(data.stats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};
