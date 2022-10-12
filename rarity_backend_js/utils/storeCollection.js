import Moralis from "moralis/node.js";
import Rarity from "../schema/raritySchema.js";

const serverUrl = "https://varzkk0evwit.usemoralis.com:2053/server";
const appId = "0kfAupQphG55NcYoOHoIaq68knWSvWD4D3XmacLM";
Moralis.start({ serverUrl, appId });

const resolveLink = (url) => {
  if (!url || !url.includes("ipfs://")) return url;
  return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
};

export async function generateRarity(collectionAddress, collection_slug, chain = "eth") {
  try {
    const collectionName = collection_slug.includes("-")
      ? collection_slug?.split("-")?.join("_")
      : collection_slug;

    const NFTs = await Moralis.Web3API.token.getAllTokenIds({
      address: collectionAddress,
      chain,
    });

    const totalNum = NFTs.total;
    const pageSize = NFTs.page_size;
    console.log(totalNum);
    console.log(pageSize);
    let allNFTs = NFTs.result;

    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    for (let i = pageSize; i < totalNum; i = i + pageSize) {
      const NFTs = await Moralis.Web3API.token.getAllTokenIds({
        address: collectionAddress,
        offset: i,
        chain,
      });
      allNFTs = allNFTs.concat(NFTs.result);
      await timer(6000);
    }

    let allMetadata = allNFTs.filter((e) => e.metadata !== null);
    let filteredMetadata = allMetadata.filter(
      (e) =>
        JSON.parse(e.metadata).attributes !== undefined && JSON.parse(e.metadata).attributes !== []
    );
    let metadata = filteredMetadata.map((e) => JSON.parse(e.metadata).attributes);

    const isNotValidMetadata = metadata.some((e) => !e.length || e === undefined);

    if (isNotValidMetadata) {
      return { error: "something went wrong" };
    }

    let tally = { TraitCount: {} };

    for (let j = 0; j < metadata.length; j++) {
      let nftTraits = metadata[j].map((e) => e.trait_type);
      let nftValues = metadata[j].map((e) => e.value);

      let numOfTraits = nftTraits.length;
      if (tally.TraitCount[numOfTraits]) {
        tally.TraitCount[numOfTraits]++;
      } else {
        tally.TraitCount[numOfTraits] = 1;
      }

      for (let i = 0; i < nftTraits.length; i++) {
        let current = nftTraits[i];
        if (tally[current]) {
          tally[current].occurences++;
        } else {
          tally[current] = { occurences: 1 };
        }

        let currentValue = nftValues[i];
        if (tally[current][currentValue]) {
          tally[current][currentValue]++;
        } else {
          tally[current][currentValue] = 1;
        }
      }
    }

    const collectionAttributes = Object.keys(tally);
    let nftArr = [];
    for (let j = 0; j < metadata.length; j++) {
      let current = metadata[j];
      let totalRarity = 0;
      let totalAverage = 0;
      let totalStatistical = 1;
      for (let i = 0; i < current.length; i++) {
        let rarityScore = 1 / (tally[current[i].trait_type][current[i].value] / totalNum);
        let averageScore = (tally[current[i].trait_type][current[i].value] / totalNum) * 100;
        let statisticalScore = (tally[current[i].trait_type][current[i].value] / totalNum) * 100;
        current[i].rarityScore = rarityScore;
        current[i].averageScore = averageScore;
        current[i].statisticalScore = statisticalScore;
        totalRarity += rarityScore;
        totalAverage += averageScore;
        totalStatistical *= averageScore;
      }

      let rarityScoreNumTraits =
        8 * (1 / (tally.TraitCount[Object.keys(current).length] / totalNum));
      current.push({
        trait_type: "TraitCount",
        value: Object.keys(current).length,
        rarityScore: rarityScoreNumTraits,
      });
      totalRarity += rarityScoreNumTraits;

      if (current.length < collectionAttributes.length) {
        let nftAttributes = current.map((e) => e.trait_type);
        let absent = collectionAttributes.filter((e) => !nftAttributes.includes(e));

        absent.forEach((type) => {
          let rarityScoreNull = 1 / ((totalNum - tally[type].occurences) / totalNum);
          let averageScoreNull = ((totalNum - tally[type].occurences) / totalNum) * 100;
          let statisticalScoreNull = ((totalNum - tally[type].occurences) / totalNum) * 100;
          current.push({
            trait_type: type,
            value: null,
            rarityScore: rarityScoreNull,
            averageScore: averageScoreNull,
            statisticalScore: statisticalScoreNull,
          });
          totalAverage += averageScoreNull;
          totalRarity += rarityScoreNull;
          totalStatistical *= statisticalScoreNull;
        });
      }

      if (filteredMetadata[j].metadata) {
        filteredMetadata[j].metadata = JSON.parse(filteredMetadata[j].metadata);
        filteredMetadata[j].image = resolveLink(filteredMetadata[j].metadata.image);
      } else if (filteredMetadata[j].token_uri) {
        try {
          await fetch(filteredMetadata[j].token_uri)
            .then((response) => response.json())
            .then((data) => {
              filteredMetadata[j].image = resolveLink(data.image);
            });
        } catch (error) {
          console.log(error);
        }
      }

      nftArr.push({
        Attributes: current,
        Rarity: totalRarity,
        Average: totalAverage,
        Statistical: totalStatistical,
        token_id: filteredMetadata[j].token_id,
        image: filteredMetadata[j].image,
        name: filteredMetadata[j].name,
      });
    }

    nftArr.sort((a, b) => b.Rarity - a.Rarity);

    for (let i = 0; i < nftArr.length; i++) {
      try {
        nftArr[i].Rank = i + 1;

        const filteredCount = nftArr[i].Attributes.filter((t) => t.value !== null);

        await Rarity.create({
          name: nftArr[i].name,
          image: nftArr[i].image,
          trait_count: filteredCount.length,
          rarity: nftArr[i].Rarity,
          average: nftArr[i].Average / nftArr[i].Attributes?.length,
          statistical: nftArr[i].Statistical,
          tokenId: nftArr[i].token_id,
          attributes: nftArr[i].Attributes,
          rank: nftArr[i].Rank,
          total_supply: totalNum,
          collection_slug,
        });
        console.log(i);
      } catch (error) {
        console.log(error);
      }
    }

    return {
      result: {
        collectionName,
        allTraits: tally,
      },
    };
  } catch (error) {
    return { error: "something went wrong" };
  }
}
