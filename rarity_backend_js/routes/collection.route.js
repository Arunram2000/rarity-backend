import express from "express";

import {
  addCollection,
  getAllCollections,
  getCollectionbySlug,
  getCollectionbyTraits,
  getCollectionbyId,
  updateCollection,
  deleteCollection,
  getNftsOfUser,
} from "../controllers/collection.js";

const router = express.Router();

router.post("/create", addCollection);
router.patch("/update/:collection_slug", updateCollection);
router.delete("/delete/:collection_slug", deleteCollection);
router.get("/v1/:collection", getCollectionbySlug);
router.get("/getNft/:user_address", getNftsOfUser);

router.get("/get_all_collection", getAllCollections);
router.get("/get_traits/:collection", getCollectionbyTraits);
router.get("/get_collection/:collection/:tokenId", getCollectionbyId);

export default router;
