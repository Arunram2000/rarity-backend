import cron from "node-cron";
import { getPendingCollection } from "../controllers/collection.js";
import { generateRarity } from "./storeCollection.js";
import Collection from "../schema/collectionShema.js";
import Admin from "../schema/adminSchema.js";
import RarityCollection from "../schema/rarityCollectionSchema.js";

export const defaultTask = cron.schedule(
  "*/30 * * * *",
  async () => {
    console.log("for every 30 minutes");
    const adminResult = await Admin.findOne({ username: "admin" });

    if (adminResult?.cronRunning === false) {
      const { data, error } = await getPendingCollection();

      if (error) {
        console.log("something went wrong");
        return;
      }

      console.log(data.collection_slug);
      await Admin.findOneAndUpdate({ username: "admin" }, { cronRunning: true }, { new: false });

      const collectionData = await generateRarity(
        data.collection_contract_address,
        data.collection_slug,
        data.chain
      );

      if (collectionData.error) {
        await Collection.findByIdAndUpdate(
          data._id,
          { isPending: false, isValid: false },
          { new: false }
        );
        await Admin.findOneAndUpdate({ username: "admin" }, { cronRunning: false }, { new: false });
        console.log("something went wrong");
        return;
      }

      if (!Object.keys(collectionData.result.allTraits.TraitCount).length) {
        await Collection.findByIdAndUpdate(
          data._id,
          { isPending: false, isValid: false },
          { new: false }
        );
        await Admin.findOneAndUpdate({ username: "admin" }, { cronRunning: false }, { new: false });
        console.log("Not a valid data");
        return;
      }

      await RarityCollection.create({
        collectionName: collectionData.result.collectionName,
        allTraits: collectionData.result.allTraits,
        traitCount: collectionData.result.allTraits.TraitCount,
      });

      await Collection.findByIdAndUpdate(data._id, { isPending: false }, { new: false });
      await Admin.findOneAndUpdate({ username: "admin" }, { cronRunning: false }, { new: false });
      console.log("done");
    }
  },
  { timezone: "Asia/Kolkata" }
);
