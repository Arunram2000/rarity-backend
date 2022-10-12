import Collection from "../schema/collectionShema.js";
import { API } from "../api/index.js";
import Moralis from "moralis/node.js";
import Rarity from "../schema/raritySchema.js";

const serverUrl = "https://varzkk0evwit.usemoralis.com:2053/server";
const appId = "0kfAupQphG55NcYoOHoIaq68knWSvWD4D3XmacLM";
Moralis.start({ serverUrl, appId });

export const addCollection = async (req, res) => {
  let collectionData;
  try {
    const { collection_url, chain, collection_name, official_twitter_url, website_url } = req.body;
    const replaced_url = collection_url
      ? collection_url.replace("https://opensea.io/collection/", "")
      : collection_name?.includes(" ")
      ? collection_name?.split(" ").join("-")
      : collection_name?.toLowerCase();

    const isExistingCollection = await Collection.findOne({
      $or: [{ collection_url, collection_slug: replaced_url, collection_name }],
    });

    if (isExistingCollection) {
      return res
        .status(201)
        .json({ error: true, message: "your collection is already on our list" });
    }

    if (!chain || chain === "eth") {
      const { data } = await API.get(`/collection/${replaced_url}`);

      collectionData = {
        ...req.body,
        collection_name: data.collection.name,
        opensea_compatible: true,
        collection_slug: replaced_url,
        collection_url,
        chain: chain ? chain : "eth",
        name: data.collection.name,
        description: data.collection.description,
        banner_image_url: data.collection.banner_image_url,
        image_url: data.collection.image_url,
        official_twitter_url: data.collection?.twitter_username
          ? `https://twitter.com/${data.collection.twitter_username}`
          : official_twitter_url,
        official_instagram_url: data.collection?.instagram_username
          ? `https://instagram.com/${data.collection.instagram_username}`
          : null,
        website_url: `${
          data.collection?.external_url ? data.collection.external_url : website_url
        }`,
        official_discord_url: data.collection.discord_url,
        collection_contract_address: data.collection?.primary_asset_contracts[0]?.address,
        marketplace_url: `https://opensea.io/assets/${data.collection?.primary_asset_contracts[0]?.address}`,
        traits: data.collection.traits,
        maximum_no_of_items: data.collection.stats.total_supply,
      };
    } else {
      collectionData = {
        ...req.body,
        collection_slug: replaced_url,
        collection_url,
        chain,
        opensea_compatible: false,
      };
    }

    const data = await Collection.create(collectionData);

    res.status(201).json({ message: "collection added successfully", data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const getPendingCollection = async () => {
  try {
    const data = await Collection.findOne({
      $and: [{ isVerified: true, isPending: true, isValid: true }],
    });

    return { data, error: false };
  } catch (error) {
    console.log(error);
    return { data: null, error: true };
  }
};

export const getAllCollections = async (req, res) => {
  let stats = null;
  try {
    const collections = await Collection.find({
      $and: [{ isVerified: true, isPending: false, isValid: true, showCollection: true }],
    });

    const result = await Promise.all(
      collections.map(async (collection) => {
        if (collection.chain === "eth") {
          try {
            const { data } = await API.get(`/collection/${collection.collection_slug}/stats`);
            if (data.success === false) stats = null;
            else stats = data.stats;
          } catch (error) {
            stats = null;
          }

          return {
            ...collection._doc,
            stats,
          };
        } else {
          return collection._doc;
        }
      })
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const updateCollection = async (req, res) => {
  try {
    const data = await Collection.findOneAndUpdate(
      { collection_slug: req.params.collection_slug },
      { ...req.body },
      { new: true }
    );

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

const getFilterBy = (method) => {
  switch (method) {
    case "average":
      return { average: -1 };
    case "statistical":
      return { statistical: -1 };
    case "trait_count":
      return { trait_count: -1 };
    default:
      return { rank: 1 };
  }
};

export const getCollectionbySlug = async (req, res) => {
  const { collection } = req.params;
  const { page, filterBy, trait_type, value } = req.query;

  const currentPage = page && !isNaN(page) ? Number(page) : 1;
  const pageSize = 48;
  const toSkip = (currentPage - 1) * pageSize;
  try {
    if (trait_type !== "undefined" && value !== "undefined") {
      let totalCount = await Rarity.count({
        $and: [{ collection_slug: collection, attributes: { $elemMatch: { trait_type, value } } }],
      });
      const filteredData = await Rarity.find({
        $and: [{ collection_slug: collection, attributes: { $elemMatch: { trait_type, value } } }],
      })
        .sort(getFilterBy(filterBy))
        .skip(toSkip)
        .limit(pageSize);

      return res.json({
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        currentPage,
        results: filteredData,
      });
    }

    const tCount = await Rarity.count({ collection_slug: collection });
    const results = await Rarity.find({ collection_slug: collection })
      .sort(getFilterBy(filterBy))
      .skip(toSkip)
      .limit(pageSize);

    res.json({
      totalPages: Math.ceil(tCount / pageSize),
      totalCount: tCount,
      currentPage,
      results,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCollectionbyId = async (req, res) => {
  const { collection, tokenId } = req.params;
  try {
    const data = await Rarity.findOne({ $and: [{ collection_slug: collection, tokenId }] });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const getCollectionbyTraits = async (req, res) => {
  let filterValues = [];
  const { trait_type, values } = req.query;
  const { collection } = req.params;

  if (!Array.isArray(values)) {
    filterValues = [...Object.values(values)];
  } else {
    filterValues = [...values];
  }

  try {
    const total_supply = await Rarity.count({ collection_slug: collection });
    const traitsData = await Promise.all(
      filterValues.map(async (value) => {
        const count = await Rarity.count({
          $and: [
            {
              collection_slug: collection,
              attributes: { $elemMatch: { trait_type, value } },
            },
          ],
        });
        const result = await Rarity.find({
          $and: [
            {
              collection_slug: collection,
              attributes: { $elemMatch: { trait_type, value } },
            },
          ],
        }).limit(4);

        const rarityScore = result.reduce((acc, r) => {
          return acc + r.rarity;
        }, 0);

        const examples = result.map((r) => {
          return {
            image: r.image,
            tokenId: r.tokenId,
          };
        });

        return {
          value,
          count,
          rarityScore: rarityScore / 4,
          examples,
        };
      })
    );

    res.json({ traitsData, count: total_supply });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "something went wrong" });
  }
};

export const deleteCollection = async (req, res) => {
  try {
    await Collection.findOneAndDelete({ collection_slug: req.params.collection_slug });

    res.json("deleted successfully");
  } catch (error) {
    console.log(error);
  }
};

export const getNftsOfUser = async (req, res) => {
  const { chain, token_address, collection_slug } = req.query;
  try {
    const data = await Moralis.Web3.getNFTs({
      chain,
      address: req.params.user_address,
    });

    const filteredData = data.filter((f) => f.token_address === token_address);

    const finalResult = await Promise.all(
      filteredData.map(async (d) => {
        const result = await Rarity.findOne({ $and: [{ collection_slug, tokenId: d.token_id }] });
        return result;
      })
    );

    const filteredFinalResult = finalResult.filter((f) => f !== null);

    res.json(filteredFinalResult);
  } catch (error) {
    console.log(error);
  }
};
