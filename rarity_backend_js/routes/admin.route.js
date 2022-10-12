import express from "express";

import {
  createNewAdmin,
  getAdminById,
  getAdminSettings,
  getAllCollectionsByAdmin,
  getCollectionByAdmin,
  login,
  updateAdminSettings,
  updatePassword,
  verifyCollection,
} from "../controllers/admin.js";

const router = express.Router();

router.post("/login", login);
router.post("/create", createNewAdmin);
router.get("/", getAdminSettings);
router.get("/get_admin/:id", getAdminById);
router.get("/get_collection", getAllCollectionsByAdmin);
router.get("/get_collection/:collection_slug", getCollectionByAdmin);

router.patch("/update", updateAdminSettings);
router.patch("/update_password", updatePassword);
router.patch("/verify_collection/:collection_slug", verifyCollection);

export default router;
