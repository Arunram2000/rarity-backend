import express from "express";

import { getCollection, getCollectionStats } from "../controllers/openseaCollection.js";
import { auth } from "../middleware/index.js";

const router = express.Router();

router.get("/v1/:collection_slug", auth, getCollection);
router.get("/v1/:collection_slug/stats", auth, getCollectionStats);

export default router;
